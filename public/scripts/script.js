API_BASE_URL = "http://localhost:4000/api"

function nodeExists(graph, nodeId) {
  return graph.nodes.some(node => node.id === nodeId);
}

function parseNeo4j(response) {
  const graph = {
    nodes: [],
    links: []
  };

  response.forEach((obj, idx) => {
    const dyn = Object.keys(obj)[0];
    const start = obj[dyn].start
    const end = obj[dyn].end
    
    const start_properties = obj[dyn].start.properties;
    const end_properties = obj[dyn].end.properties;
    
    if (!nodeExists(graph, start.elementId)) {
      graph.nodes.push({
        id: start.elementId,
        color: '#8ce8e8',
        name: start_properties.title,
        val: 1
      });
    }

    if (!nodeExists(graph, end.elementId)) {
      graph.nodes.push({
        id: end.elementId,
        color: '#ff00bd',
        name: end_properties.name,
        val: 1
      });
    }
    graph.links.push({
      source: start.elementId,
      target: end.elementId
    });
  });
  const Graph = ForceGraph3D()
  (document.getElementById('3d-graph'))
      .graphData(graph);
  console.log(graph);
}

function parseElastic(response) {
  console.log(response);
  var ul = $('#elasticresult');
  ul.empty();
  const hits = response.hits.hits;
  if(hits.length != 0){
    hits.forEach(hit => {
      console.log(hit);
      const id = hit['_id'];
      const score = hit['_score'];
      const doc = hit['_source'];
      var listItem = $('<li>').addClass('list-group-item');
      var preview = $('<div>').addClass('preview');
      preview.append(`<h3>${doc.title}</h3>`);
      preview.append(`<pre>doc_id: ${id} - score: ${score}</pre>`);
      preview.append(`<p><i style='color: blue'>${doc.authors}</i>, submitted by <i>${doc.submitter}</i> on ${doc.ref}</p>`);
      preview.append(`<p><strong>Abstract:</strong> ${doc.abstract}</p>`);
      preview.append(`<p><strong>Comments:</strong> ${doc.comments}</p>`);
      preview.append(' <div class="d-inline-flex flex-nowrap">')
      doc.categories.split(' ').forEach(cat => {
        preview.append(`<span class="badge badge-secondary custom-tag">${cat}</span>`)
      });
      listItem.append(preview);
      ul.append(listItem);
    });
  } else {
    var listItem = $('<li>').addClass('list-group-item lisep');
    var preview = $('<div>').addClass('preview');
    preview.append(`<h3>Non document response</h3>`);
    preview.append('<div id="browser" class="jsonbrowser"></div>');
    listItem.append(preview);
    ul.append(listItem);
    $('#browser').jsonbrowser(response);
  }
}

$(document).ready(function() {
    const initialState = cm6.createEditorState();
    const view = cm6.createEditorView(initialState, document.getElementById("editor"), {
      scrollbars: {
        vertical: 'auto',
        horizontal: 'auto'
      }
    });

    const selectedOption = $("#modeselector").val();
    if (selectedOption === 'neo4j') {
      const Graph = ForceGraph3D()(document.getElementById('3d-graph')).graphData({
        nodes: [],
        links: []
      });
    } else if (selectedOption === 'elastic') {
      $("#3d-graph").empty();
      $("#3d-graph").html("<div class='elasticdisplay'></div>");
    }

    $('#modeselector').on('change', function() {
      const selectedOption = $(this).val();
      if (selectedOption === 'neo4j') {
        const Graph = ForceGraph3D()(document.getElementById('3d-graph')).graphData({
          nodes: [],
          links: []
        });
      } else if (selectedOption === 'elastic') {
        $("#3d-graph").empty();
        $("#3d-graph").html("<div class='elasticdisplay overflow-auto'><ul class='separator-list' id='elasticresult'></ul></div>");
      }
    });

    $("#examplebtn").click(function(){
      let mode = $("#modeselector").val() == 'neo4j' ?  'graph' : 'text';
      $.ajax({
        url: API_BASE_URL + '/examples/' + mode + '/',
        method: 'GET',
        success: function(data) {
          var ul = $('#examplequeries');
          ul.empty();
          data.forEach(function(item) {
            var listItem = $('<li>').addClass('list-group-item');
            var title = $('<b>').addClass('mb-1').html(item.text + "<br><br>");
            listItem.append(title);
            var body = $('<pre>').addClass('mb-1').html(item.query);
            listItem.append(body);
            ul.append(listItem);
          });
          $('#customModal').modal('show');
        },
        error: function() {
          console.error('Error in example queries request');
        }
      });
    });

    $('#examplequeries').on('click', 'pre.mb-1', function() {
      var content = $(this).html();
      cypherQuery = content.replace(/&lt;/g, '<');
      cypherQuery = cypherQuery.replace(/&gt;/g, '>');
      cypherQuery = cypherQuery.replace(/<br>/g, '\n');

      view.dispatch({
        changes: {from: 0, to: view.state.doc.toString().length, insert: cypherQuery}
      });

      var clearBtn = document.getElementById('closeModal');
      clearBtn.click();
  });

    $('#runbtn').click(function() {
      let mode = $("#modeselector").val() == 'neo4j' ?  'graph' : 'text';
      let value = view.state.doc.toString();
      if(value == '') return;
      $.ajax({
        url: API_BASE_URL + '/' +  mode + '/',
        type: 'GET',
        data: { query:  encodeURIComponent(value)},
        success: function (response) {
          if($("#modeselector").val() == 'neo4j') {
            parseNeo4j(response);
          }
          else if ($("#modeselector").val() == 'elastic'){
            parseElastic(response);
          }
        },
        error: function (xhr, status, error) {
          console.error('Error:', error);
        }
      });
    });

    $('#clearbtn').click(function() {
      let mode = $("#modeselector").val() == 'neo4j' ?  'graph' : 'text';
      if(mode == 'graph'){
        const Graph = ForceGraph3D()(document.getElementById('3d-graph')).graphData({
          nodes: [],
          links: []
        });
      }else{
        $('#elasticresult').empty();
      }
      view.dispatch({
        changes: {from: 0, to: view.state.doc.toString().length, insert:''}
      })
    });
});