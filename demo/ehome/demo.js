jsPlumb.ready(function () {
    // setup some defaults for jsPlumb.
    var instance = jsPlumb.getInstance({
        EndpointStyle: {radius: 6, fill: "#7AB02C"},
        Connector: "StateMachine",
        //Connector: "Bezier",
        HoverPaintStyle: {stroke: "#1e8151", strokeWidth: 2},
        ConnectionOverlays: [
            ["Arrow", {
                location: 1,
                id: "arrow",
                length: 14,
                foldback: 0.8
            }],
            // [ "Label", { label: "FOO", id: "label", cssClass: "aLabel" }]
        ],
        Container: "canvas"
    });

    instance.registerConnectionType("basic", {
        anchors: ["RightMiddle", "LeftMiddle"],
        endpoints: ["Blank", "Dot"],
        connector: "StateMachine"
    });

    window.jsp = instance;

    var canvas = document.getElementById("canvas");
    var windows = jsPlumb.getSelector(".statemachine-demo .w");

    //
    // initialise element as connection targets and source.
    //
    var initNode = function (el, type) {
        if (!type) {
            type = 'NORMAL';
        }

        // initialise draggable elements.
        instance.draggable(el);

        instance.makeSource(el, {
            filter: ".ep",
            endpoints: ["Blank", "Dot"],
            anchor: "RightMiddle",
            connectorStyle: {stroke: "#5c96bc", strokeWidth: 2, outlineStroke: "transparent", outlineWidth: 4},
            connectionType: "basic",
            extract: {
                "action": "the-action"
            },
            maxConnections: 20,
            onMaxConnections: function (info, e) {
                alert("Maximum connections (" + info.maxConnections + ") reached");
            }
        });

        instance.makeTarget(el, {
            // endpoint:"Dot",
            // paintStyle:{ radius: 6, fill:"yellow" },
            isTarget: true,
            dropOptions: {hoverClass: "dragHover"},
            anchor: "LeftMiddle",
            allowLoopback: false
        });

        // this is not part of the core demo functionality; it is a means for the Toolkit edition's wrapped
        // version of this demo to find out about new nodes being added.
        //
        instance.fire("jsPlumbDemoNodeAdded", el);
    };

    var newNode = function (id, type, label) {
        var d = document.createElement("div");
        if (type === "NORMAL") {
            d.className = "w";
        } else if(type === 'CONDITION') {
            d.className = "w diamond";
        } else {
            d.className = "w endpoint";
        }
        d.id = id;
        d.innerHTML = '<div class="text">'+label+'</div><div class="ep"></div>';
        d.style.left = "20px";
        d.style.top = "20px";
        instance.getContainer().appendChild(d);
        initNode(d, type);
        return d;
    };

    instance.initNode = initNode;
    instance.newNode = newNode;
    var flow = new flowGraph("canvas");

    // bind a click listener to each connection; the connection is deleted. you could of course
    // just do this: jsPlumb.bind("click", jsPlumb.detach), but I wanted to make it clear what was
    // happening.
    instance.bind("click", function (info) {
        //sourceId, targetId
        instance.deleteConnection(info);
    });

    // bind a connection listener. note that the parameter passed to this function contains more than
    // just the new connection - see the documentation for a full list of what is included in 'info'.
    // this listener sets the connection's internal
    // id as the label overlay's text.
    instance.bind("connection", function (info) {
        //console.log(info, 'connection')
        flow.evtNewConnection(info.sourceId, info.targetId);
    });

    instance.bind("connectionDetached", function (info) {
        //console.log(info, 'connectionDetached');
        flow.evtDeleteConnection(info.sourceId, info.targetId);
    });

    document.getElementById("addTask").onclick = function () {
        //newNode(jsPlumbUtil.uuid(), 'NORMAL', 'NORMAL');
        flow.evtNewNode('id'+jsPlumbUtil.uuid(), 'NORMAL');
    };

    document.getElementById("addSwitch").onclick = function () {
        //newNode(jsPlumbUtil.uuid(), 'CONDITION', 'CONDITION');
        flow.evtNewNode('id'+jsPlumbUtil.uuid(), 'CONDITION');
    };

    $('#id_auto_adj').click(function() {
        console.log("new paint");
        flow.paint();
        instance.repaintEverything();
    });

    // suspend drawing and initialise.
    instance.batch(function () {
        flow.paint();
    });

    jsPlumb.fire("jsPlumbDemoLoaded", instance);
});
