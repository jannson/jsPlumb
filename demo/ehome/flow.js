;(function(){

    var HGAP = 10;
    var VGAP = 20;

    var interfaceNode = {
        createHtml:function() {
            this.createHtmlImpl.apply(this, arguments);
        },
        layout:function() {
            this.layoutImpl.apply(this, arguments);
        },
        getHeight:function() {
            this.getHeightImpl.apply(this, arguments);
        },
        getWidth:function() {
            this.getWidthImpl.apply(this, arguments);
        },
        calcSize:function(ctx) {
            var self = this;
            var width = 0;
            var heigh = 0;
            for(var i = 0; i < self.link_to.length; i++) {
                var node = ctx.map[self.link_to[i]];
                node.calcSize(ctx);
                if (width < node.boxWidth) {
                    width = node.boxWidth;
                }
                heigh += node.boxHeight + HGAP;
            }

            self.boxWidth = width + self.getWidth() + 2*VGAP;
            self.boxHeight = height - HGAP;
        },
        connect:function(val) {
            //
        }
    };

    var getData = function() {
        var data = {}
        data.objs = [
            {"id":"id_start", "label":"开始", "flowType":"START"},

            {"id":"id_C1", "label":"C1", "flowType":"CONDITION"},
            {"id":"id_A1", "label":"A1", "flowType":"NORMAL"},
            {"id":"id_A2", "label":"A2", "flowType":"NORMAL"},
            {"id":"id_C2", "label":"C2", "flowType":"CONDITION"},
            {"id":"id_A31", "label":"A31", "flowType":"NORMAL"},
            {"id":"id_A32", "label":"A32", "flowType":"NORMAL"},
            {"id":"id_A41", "label":"A41", "flowType":"NORMAL"},
            {"id":"id_A42", "label":"A42", "flowType":"NORMAL"},
            {"id":"id_A43", "label":"A43", "flowType":"NORMAL"},
            {"id":"id_D1", "label":"D1", "flowType":"NORMAL"},
            {"id":"id_A5", "label":"A5", "flowType":"NORMAL"},
            {"id":"id_B1", "label":"B1", "flowType":"NORMAL"},
            {"id":"id_B2", "label":"B2", "flowType":"NORMAL"},
            {"id":"id_B3", "label":"B3", "flowType":"NORMAL"},
            {"id":"id_D2", "label":"D2", "flowType":"NORMAL"},

            {"id":"id_end", "label":"结束", "flowType":"END"}
        ];
        data.links = [
            ["id_start", "id_C1"],

            ["id_C1", "id_B1"],
            ["id_B1", "id_B2"],
            ["id_B2", "id_B3"],
            ["id_C1", "id_A1"],
            ["id_A1", "id_A2"],
            ["id_B3", "id_D2"],
            ["id_A2", "id_C2"],
            ["id_C2", "id_A31"],
            ["id_C2", "id_A41"],
            ["id_A41", "id_A42"],
            ["id_A42", "id_A43"],
            ["id_A43", "id_D1"],
            ["id_A32", "id_D1"],
            ["id_A31", "id_A32"],
            ["id_D1", "id_A5"],
            ["id_A5", "id_D2"],

            ["id_D2", "id_end"]
        ]
        return data;
    };

    var data2map = function(data) {
        var map = {};
        for (var i = 0; i < data.objs.length; i++) {
            var obj = data.objs[i];
            obj["link_to"] = [];
            obj["link_from"] = [];
            map[obj.id] = obj;
        }

        for (var i = 0; i < data.links.length; i++) {
            var link = data.links[i];
            var obj1 = map[link[0]];
            var obj2 = map[link[1]];
            if ((!obj1) || (!obj2)) {
                continue;
            }
            obj1["link_to"].push(obj2.id);
            obj2["link_from"].push(obj1.id);
        }

        return map;
    };

    var findAfters = function(ctx, nodeId) {
        var map = ctx.map;
        var next = calcNearNode(ctx, nodeId);
        var arr = [];
        while(next != ctx.idEnd) {
            arr.push(next);
            next = calcNearNode(ctx, next);
        }

        return arr;
    };

    var isReach = function(ctx, id1, id2) {
        var ids = findAfters(ctx, id1);
        for(var i = 0; i < ids.length; i++) {
            if (ids[i] == id2) {
                return true;
            }
        }

        return false;
    };

    var calcNearNode = function(ctx, nodeId) {
        var map = ctx.map;
        var nears = ctx.nears;
        var node = map[nodeId];
        if (nears[nodeId]) {
            return nears[nodeId];
        } else if(node.link_to.length == 0) {
            nears[nodeId] = ctx.idEnd;
        } else if(node.link_to.length == 1) {
            nears[nodeId] = node.link_to[0];
        } else {
            //multiple directions
            var nid0 = node.link_to[0];
            while(nid0 != ctx.idEnd) {
                var next0 = calcNearNode(ctx, nid0);
                var ok = false;
                for(var i = 1; i < node.link_to.length; i++) {
                    ok = isReach(ctx, node.link_to[i], next0);
                    if(!ok) {
                        break;
                    }
                }

                if (ok) {
                    nears[nodeId] = next0;
                    return next0;
                } else {
                    nid0 = next0;
                }

            }

            nears[nodeId] = ctx.idEnd;
        }

        return nears[nodeId];

    };

    var calcNearNodes = function(ctx) {
        //var ctx = {"idStart":"id_start", "idEnd":"id_end", "map":map, "nears":{}};
        var next = calcNearNode(ctx, ctx.idStart);
        while(next != ctx.idEnd) {
            next = calcNearNode(ctx, next);
        }
        //console.log("nears=", ctx.nears);

        //var ids = findAfters(ctx, "id_A1");
        //console.log("ids=", ids);
    };

    var conditionNode = function(obj) {
        var self = this;
        for (k in obj) {
            self[k] = obj[k];
        }

        self.createHtmlImpl = function() {
            jsp = window.jsp;
            jsp.newNode(self.id, self.flowType, self.label);
        };

        self.layoutImpl = function() {

        };

        self.getHeightImpl = function() {
            return 150;
        };

        self.getWidthImpl = function() {
            return 150;
        };
    };

    var normalNode = function(obj) {
        var self = this;
        for (k in obj) {
            self[k] = obj[k];
        }

        self.createHtmlImpl = function() {
            jsp = window.jsp;
            jsp.newNode(self.id, self.flowType, self.label);
        };

        self.layoutImpl = function() {

        };

        self.getHeightImpl = function() {
            return 60;
        };

        self.getWidthImpl = function() {
            return 100;
        };
    };

    var startNode = function(obj) {
        var self = this;
        for (k in obj) {
            self[k] = obj[k];
        }

        self.createHtmlImpl = function() {
            jsp = window.jsp;
            jsp.newNode(self.id, self.flowType, self.label);
        };

        self.layoutImpl = function() {

        };

        self.getHeightImpl = function() {
            return 60;
        };

        self.getWidthImpl = function() {
            return 100;
        };
    };

    var endNode = function(obj) {
        var self = this;
        for (k in obj) {
            self[k] = obj[k];
        }

        self.createHtmlImpl = function() {
            jsp = window.jsp;
            jsp.newNode(self.id, self.flowType, self.label);
        };

        self.layoutImpl = function() {

        };

        self.getHeightImpl = function() {
            return 60;
        };

        self.getWidthImpl = function() {
            return 100;
        };
    };

    conditionNode.prototype = new conditionNode();
    startNode.prototype = new startNode();
    endNode.prototype = new endNode();
    normalNode.prototype = new normalNode();
    jQuery.extend(conditionNode.prototype, interfaceNode);
    jQuery.extend(startNode.prototype, interfaceNode);
    jQuery.extend(endNode.prototype, interfaceNode);
    jQuery.extend(normalNode.prototype, interfaceNode);

    var flowGraph = function() {
        var self = this;
        var data = getData();
        var map = data2map(data);
        self.map = {};
        for (k in map) {
            self.map[k] = self.createHtml(map[k]);
        }

        console.log("graph created");
    };

    flowGraph.prototype = {
        createHtml:function(obj) {
            var dom;
            if (obj["flowType"] == "CONDITION") {
                dom = new conditionNode(obj);
            } else if (obj["flowType"] == "NORMAL") {
                dom = new normalNode(obj);
            } else if (obj["flowType"] == "START") {
                dom = new startNode(obj);
            } else if (obj["flowType"] == "END") {
                dom = new endNode(obj);
            } else {
                console.log("flowType error=" + obj["flowType"]);
                return;
            }

            //console.log("dom=", dom);
            dom.createHtml();

            //console.log("id=", dom.id, "width,height=", $('#'+dom.id).width(), $('#'+dom.id).height());
            return dom;
        },
        paint:function() {
            var self = this;
            var start = self.map["id_start"];

            var ctx = {"graph":self, "idStart":"id_start", "idEnd":"id_end", "map":self.map, "nears":{}};
            calcNearNodes(ctx);

            start.calcSize(ctx);
            start.layout(ctx);
            console.log("start.boxWidth", start.boxWitdh, "startBoxHeight", start.boxHeight);

        }
    };

    window.flowGraph = flowGraph;

})();

