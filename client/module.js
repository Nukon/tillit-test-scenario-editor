'use strict'; 
var domify = require('min-dom/lib/domify');

let JSONEditor = require('@json-editor/json-editor/dist/jsoneditor')

var CamundaPropertiesProvider = require('bpmn-js-properties-panel/lib/provider/camunda/CamundaPropertiesProvider');
var entryFactory = require('bpmn-js-properties-panel/lib/factory/EntryFactory');
var is = require('bpmn-js/lib/util/ModelUtil').is;

function TestScenarioPluginProvider(eventBus, elementRegistry, bpmnFactory, elementTemplates, translate) {
   var camunda = new CamundaPropertiesProvider(eventBus, bpmnFactory, elementRegistry, elementTemplates, translate);
    var testScenarioTab = null;
    var editor = null;
    var processScenarios = [];
    this.getTabs = function (element) {
        var array = camunda.getTabs(element);
        if (is(element, 'bpmn:Process')) { 
           var newGeneralTab = this.getGeneralTab(array[0], element);
           array[0] = newGeneralTab;

        }
        return array;
    };
}


TestScenarioPluginProvider.prototype.getGeneralTab = function (generalTab, element) {
  var self = this;  
      var lastgroup = generalTab.groups.length;
      var entries = [];
     
    /* margin-top: 17px; */
    
    
     entries.push({
          html: "<button id='open-editor' data-action='openEditor' style='width:200px;display: inline;'>Test Scenarios</button>",
          id: "open-test-scenarios",
          canClear: function() { return false},
          openEditor: function (element, node) {
              self.openEditor(element);
          }
      });

      var group = {
        id: "test-scenarios-group",
        label: "Test Scenarios",
        entries: entries
      }

      generalTab.groups.push(group);
  

  return generalTab;
};

TestScenarioPluginProvider.prototype.openEditor = function (element) {
  var editorSource = '<div width="100%"><div id="jsoneditor_container" style="height: 100%"></div></div>';
  var domHtml = domify(editorSource);
  var editor;
  swal({
      text: "Script Editor",
      content: domHtml
  }).then(() => { 
          document.querySelector('.swal-overlay').removeChild(document.querySelector('.swal-modal'));
      }
  );
      var that = this;
  setTimeout(() => {
      that.renderJsonEditor(element);
      var m = document.querySelector('.swal-modal');
      m.style.width = '90%';
      m.style.height = '80%';
      m.style.maxHeight = '650px'; 
  }, 1);

};


TestScenarioPluginProvider.prototype.renderJsonEditor = function(element) {
  console.log('rendering');
  var that = this;
  var jsoneditor_container = document.getElementById('jsoneditor_container');
  if (jsoneditor_container != null) { 
  var options = {  
    iconlib: "fontawesome5",
    theme: 'barebones',
    schema: require('./schema.json')
  };
  
  debugger;
  var bo = element.businessObject;          
  this.editor = new JSONEditor(jsoneditor_container, options);
  if (bo.extensionElements == null || !bo.extensionElements.get('values').some((f=>f.$type === 'nukon:TestScenario'))) {    
    this.editor.testScenarioModel = bo.$model.create('nukon:TestScenario', { textFormat: 'text/x-comments' });
    this.editor.testScenarioModel.data = '[]';    
    bo.extensionElements = bo.extensionElements || bo.$model.create('bpmn:ExtensionElements');
    bo.extensionElements.get('values').push(this.editor.testScenarioModel);    
  } else {
    this.editor.testScenarioModel = bo.extensionElements.get('values').filter((f=>f.$type === 'nukon:TestScenario'))[0];
  }
  
      
  this.editor.setValue(JSON.parse(this.editor.testScenarioModel.data));
  
  this.editor.on('change',function() {    
    this.testScenarioModel.data = JSON.stringify(this.getValue());
    console.log(JSON.stringify(this.getValue()))
    
  });


}

}
TestScenarioPlugin.$inject = ['eventBus', 'elementRegistry', 'bpmnFactory', 'elementTemplates'];

function TestScenarioPlugin() {

}
export default {
    __init__: ['testScenarioPlugin'],
    propertiesProvider: ['type', TestScenarioPluginProvider],
    testScenarioPlugin: ['type', TestScenarioPlugin]
};
