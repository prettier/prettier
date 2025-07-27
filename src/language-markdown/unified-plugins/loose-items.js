/** @import {Plugin, Settings} from "unified" */

/**
 * @type {Plugin<[], Settings>}
 */
const looseItems = function () {
  const proto = this.Parser.prototype;
  const originalList = proto.blockTokenizers.list;

  function fixListNodes(value, node, parent) {
    if (node.type === "listItem") {
      node.spread ||= value.endsWith("\n");
      if (node.spread) {
        parent.spread = true;
      }
    }
    return node;
  }

  proto.blockTokenizers.list = function list(realEat, value, silent) {
    function eat(subvalue) {
      const realAdd = realEat(subvalue);

      function add(node, parent) {
        return realAdd(fixListNodes(subvalue, node, parent), parent);
      }
      add.reset = function (node, parent) {
        return realAdd.reset(fixListNodes(subvalue, node, parent), parent);
      };

      return add;
    }
    eat.now = realEat.now;
    return originalList.call(this, eat, value, silent);
  };
};

export default looseItems;
