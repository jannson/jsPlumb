;(function(){

    var HGAP = 20;
    var VGAP = 30;
    var VGAP2 = 20;

    var interfaceNode = {
        createHtml:function() {
            this.createHtmlImpl.apply(this, arguments);
        },
        layout:function(ctx, x, y, end) {
            //this.layoutImpl.apply(this, arguments);
            var self = this;
            self.x = x + VGAP;
            self.y = y - self.getHeight()/2;
            if(self.flowType == "CONDITION") {
                self.x += VGAP2;
            }
            $('#'+self.id).css("left", self.x);
            $('#'+self.id).css("top", self.y);

            var x0 = self.x + self.getWidth();
            var y0 = y;
            if(self.link_to.length == 0) {
                return;
            } else if(self.link_to.length == 1) {
                var nid = self.link_to[0];
                if(nid == end) {
                    //the self is the end
                    return;
                }
                var node = ctx.map[nid];
                node.layout(ctx, x0, y0, end);
            } else {
                var near = ctx.nears[self.id];
                var y1 = y - self.boxHeight/2;
                var nearWidth = 0;
                for(var i = 0; i < self.link_to.length; i++) {
                    var node = ctx.map[self.link_to[i]];
                    y1 += node.boxHeight/2;
                    node.layout(ctx, x0, y1, near);
                    y1 += node.boxHeight/2 + HGAP;
                    if(nearWidth < node.boxWidth) {
                        nearWidth = node.boxWidth;
                    }
                }
                if (near == end) {
                    return;
                }
                var node = ctx.map[near];
                x0 += nearWidth + VGAP;
                node.layout(ctx, x0, y0, end);
            }
        },
        getHeight:function() {
            return this.getHeightImpl.apply(this, arguments);
        },
        getWidth:function() {
            return this.getWidthImpl.apply(this, arguments);
        },
        calcBoxSize:function(ctx, end) {
            //calc box size from self to end
            var self = this;
            var width = 0;
            var height = 0;

            if(self.link_to.length == 0) {
                self.boxWidth = self.getWidth();
                self.boxHeight = self.getHeight();
                return;
            } else if(self.link_to.length == 1) {
                var nid = self.link_to[0];
                if(nid == end) {
                    //the next is the end
                    self.boxWidth = self.getWidth();
                    self.boxHeight = self.getHeight();
                    return;
                }

                //calc the next box size
                var node = ctx.map[nid];
                node.calcBoxSize(ctx, end);
                self.boxWidth = node.boxWidth + self.getWidth() + VGAP;
                self.boxHeight = node.boxHeight;
            } else {
                var near = ctx.nears[self.id];
                for(var i = 0; i < self.link_to.length; i++) {
                    var node = ctx.map[self.link_to[i]];
                    node.calcBoxSize(ctx, near);
                    if (width < node.boxWidth) {
                        //choose the max width
                        width = node.boxWidth;
                    }
                    height += node.boxHeight + HGAP;
                }
                height -= HGAP;

                //near to end
                var node = ctx.map[near];
                node.calcBoxSize(ctx, end);
                if(node.boxHeight > height) {
                    height = node.boxHeight;
                }

                self.boxWidth = node.boxWidth + width + self.getWidth() + VGAP2 + 2*VGAP;
                self.boxHeight = height;
            }
        },
        connect:function(ctx) {
            jsp = window.jsp;
            var self = this;
            for(var i = 0; i < self.link_to.length; i++) {
                var nid = self.link_to[i];
                jsp.connect({source: self.id, target:nid, type: "basic"});
                var node = ctx.map[nid];
                node.connect(ctx);
            }
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

            //loop
            //["id_A43", "id_A2"],

            ["id_D2", "id_end"]
        ]
        return data;
    };

    var getData2 = function() {
        var data = {}
        data.objs = [
            {"id":"id_start", "label":"开始", "flowType":"START"},

            {"id":"id_A1", "label":"A1", "flowType":"NORMAL"},
            {"id":"id_C1", "label":"C1", "flowType":"CONDITION"},
            {"id":"id_A31", "label":"A31", "flowType":"NORMAL"},
            {"id":"id_A32", "label":"A32", "flowType":"NORMAL"},
            {"id":"id_A41", "label":"A41", "flowType":"NORMAL"},
            {"id":"id_D1", "label":"D1", "flowType":"NORMAL"},
            {"id":"id_A5", "label":"A5", "flowType":"NORMAL"},

            {"id":"id_end", "label":"结束", "flowType":"END"}
        ];
        data.links = [
            ["id_start", "id_A1"],
            ["id_A1", "id_C1"],
            ["id_C1", "id_A31"],
            ["id_C1", "id_A41"],
            ["id_A31", "id_A32"],
            ["id_A32", "id_D1"],
            ["id_A41", "id_D1"],
            ["id_D1", "id_A5"],

            //loop
            //["id_D1", "id_A32"],
            //["id_A5", "id_A31"],

            ["id_A5", "id_end"]
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

        self.getHeightImpl = function() {
            return 100;
        };

        self.getWidthImpl = function() {
            return 120;
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

    var dfsVisit = function(ctx, nodeId) {
        var map = ctx.map;
        var link_to = ctx.link_to;
        var visit = ctx.visit
        var father = ctx.father;
        var node = map[nodeId];

        visit[nodeId] = 1;
        for (var i = 0; i < map[nodeId].link_to.length; i++) {
            var k = map[nodeId].link_to[i];
            if(nodeId != k) {
                if(visit[k] == 1 && nodeId != father[k]) {
                    //深度搜索，如果从一个节点出发深层搜索，又遇到自己连接上自己的父节点，则有环路
                    //detch loop
                    var tmp = nodeId;
                    var cycle = '';
                    while(tmp != k) {
                        cycle = cycle + ' ' + tmp +  '->';
                        tmp = father[tmp];
                    }
                    cycle = cycle + ' ' + tmp;
                    console.log("loop detech", cycle);
                    ctx.loop = true;
                } else if(visit[k] == 0) {
                    father[k] = nodeId;
                    dfsVisit(ctx, k);
                }
            }
        }

        visit[nodeId] = 2;
    };

    var dfs = function(map) {
        var visit = {};     // visit states
        var father = {};    // the nodes link to current node
        var link_to = {};
        for(var k in map) {
            visit[k] = 0;
            father[k] = -1;
            var node = map[k];
            for(var i = 0; i < node.link_to.length; i++) {
                link_to[k+'$'+node.link_to[i]] = 1;
            }
        }

        var ctx = {};
        ctx.map = map;
        ctx.visit = visit;
        ctx.father = father;
        ctx.link_to = link_to;
        ctx.loop = false;
        for(var k in map) {
            if(visit[k] == 0) {
                dfsVisit(ctx, k);
            }
        }

        return ctx.loop;
    };

    var flowGraph = function(container) {
        var self = this;
        self.container = container;
        var data = getData();
        var map = data2map(data);
        self.map = {};
        for (k in map) {
            self.map[k] = self.createHtml(map[k]);
        }

        //console.log("graph created");
    };

    flowGraph.prototype = {
        loopDetach:function() {
            var self = this;
            return dfs(self.map);
        },
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

            if(self.loopDetach()) {
                console.log("loopDetach");
                return;
            }

            var start = self.map["id_start"];

            var ctx = {"graph":self, "idStart":"id_start", "idEnd":"id_end", "map":self.map, "nears":{}};
            calcNearNodes(ctx);

            start.calcBoxSize(ctx, ctx.idEnd);

            //var end = self.map["id_D2"];
            //end.calcBoxSize(ctx);
            //var start = end;

            console.log("start.boxWidth", start.boxWidth, "startBoxHeight", start.boxHeight);

            var defw = 1300;
            var defh = 600;
            var boxw = start.boxWidth + 200;
            if (boxw > defw) {
                defw = boxw;
            }
            if (start.boxHeight > defh) {
                defh = start.boxHeight;
            }
            $('#'+self.container).css("width", defw);
            $('#'+self.container).css("height", defh);

            var x0 = 0;
            var y0 = defh/2;
            start.layout(ctx, x0, y0, ctx.idEnd);

            var end = self.map["id_end"];
            $('#'+end.id).css("left", start.x + start.boxWidth + VGAP);
            $('#'+end.id).css("top", start.y);

            //connect all points
            start.connect(ctx);
        }
    };

    window.flowGraph = flowGraph;

})();

