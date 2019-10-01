'use strict';

var domify = require('min-dom/lib/domify');
var ace = require('brace');
var swal = require('sweetalert');

var CamundaPropertiesProvider = require('bpmn-js-properties-panel/lib/provider/camunda/CamundaPropertiesProvider');

function AceScriptPluginProvider(eventBus, elementRegistry, bpmnFactory, elementTemplates, translate) {
    var camunda = new CamundaPropertiesProvider(eventBus, bpmnFactory, elementRegistry, elementTemplates, translate);
    this.getTabs = function (element) {
        // debugger;
        var array = camunda.getTabs(element);
        // return array;
        if (document.querySelector('.ace_editor') == null) {
            var formIndex;
            var formsTab = array.filter(function (item, index) {
                if (item.id == 'general') {
                    formIndex = index;
                    return true;
                }
            });
            if (formsTab.length > 0) {
                var newFormsTab = this.getGeneralTab(formsTab[0]);
                if (newFormsTab != null)
                    array[formIndex] = newFormsTab;
            }
        }
        return array;
    };
}


AceScriptPluginProvider.prototype.getGeneralTab = function (generalTab) {
    var self = this;

    var detailsIndex = generalTab.groups.findIndex((t) => t.id === 'details');
    var scriptIndex = generalTab.groups[detailsIndex].entries.findIndex((t) => t.id === 'script-implementation');
    if (scriptIndex > -1) {
        generalTab.groups[detailsIndex].entries.splice(2, 0, {
            html: "<button id='preview-button' data-action='openEditor'>Expand Editor</button>",
            id: "script-expand-editor-button",
            openEditor: function (element, node) {
                self.openEditor(generalTab.groups[detailsIndex].entries[scriptIndex]);
            }
        });
    }

    return generalTab;
};

AceScriptPluginProvider.prototype.openEditor = function (scriptEntry) {
    var editorSource = '<div width="100%"><div id="full-editor" style="height: 100%"></div></div>';
    var domHtml = domify(editorSource);
    var editor;
    swal({
        text: "Script Editor",
        content: domHtml
    }).then(() => {

            var scriptValue = editor.getSession().getValue();
            var scriptElement = document.querySelector('#cam-script-val');
            scriptElement.value = scriptValue;
            var e = document.createEvent('HTMLEvents');
            e.initEvent('input', true, true);
            scriptElement.dispatchEvent(e);
            document.querySelector('.swal-overlay').removeChild(document.querySelector('.swal-modal'));
        }
    );

    setTimeout(() => {
        var m = document.querySelector('.swal-modal');
        m.style.width = '90%';
        m.style.height = '80%';
        m.style.maxHeight = '650px';
        var height = window.getComputedStyle(m).height;
        document.querySelector('#full-editor').style.height = height;
        editor = ace.edit("full-editor");
        editor.getSession().setValue(document.querySelector('#cam-script-val').value);
    }, 1);

};

AceScriptEditorPlugin.$inject = ['eventBus', 'elementRegistry', 'bpmnFactory', 'elementTemplates'];

function AceScriptEditorPlugin() {

}
export default {
    __init__: ['aceScriptEditorPlugin'],
    propertiesProvider: ['type', AceScriptPluginProvider],
    aceScriptEditorPlugin: ['type', AceScriptEditorPlugin]
};
