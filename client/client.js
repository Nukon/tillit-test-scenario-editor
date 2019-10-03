import {
    registerBpmnJSPlugin,
    registerBpmnJSModdleExtension
} from 'camunda-modeler-plugin-helpers';

import module from './module';
import ModdleExtension from './moddleExtension.json';
registerBpmnJSModdleExtension(ModdleExtension);
registerBpmnJSPlugin(module);
