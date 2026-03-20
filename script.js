let graph = {};
let nodeCount = 0;
let edgeMode = false;
let selectedNode = null;

const graphDiv = document.getElementById("graph");

// Click inside graph to create node
graphDiv.addEventListener("click", function (e) {
    if (edgeMode) return; // don't add node in edge mode

    let node = document.createElement("div");
    node.className = "node";
    node.innerText = nodeCount;

    node.style.left = (e.offsetX - 20) + "px";
    node.style.top = (e.offsetY - 20) + "px";

    node.dataset.id = nodeCount;

    node.addEventListener("click", handleNodeClick);

    graphDiv.appendChild(node);

    graph[nodeCount] = [];
    nodeCount++;
});

function addNode() {
    alert("Click inside graph to add node");
}

function enableEdgeMode() {
    edgeMode = true;
    selectedNode = null;
    alert("Click two nodes to connect them");
}

function handleNodeClick(e) {
    e.stopPropagation(); // prevent graph click

    if (!edgeMode) return;

    let nodeId = parseInt(e.target.dataset.id);

    if (selectedNode === null) {
        selectedNode = nodeId;
        e.target.classList.add("active");
    } else {
        addEdge(selectedNode, nodeId);

        // remove highlight
        document.querySelectorAll(".node").forEach(n => n.classList.remove("active"));

        selectedNode = null;
        edgeMode = false;
    }
}

function addEdge(u, v) {
    let weight = prompt("Enter weight:");

    weight = parseInt(weight);

    if (isNaN(weight)) {
        alert("Invalid weight");
        return;
    }

    graph[u].push({ node: v, weight: weight });
    graph[v].push({ node: u, weight: weight });

    drawEdge(u, v);
}

function drawEdge(u, v) {
    let nodes = document.getElementsByClassName("node");

    let node1 = nodes[u];
    let node2 = nodes[v];

    let graphRect = document.getElementById("graph").getBoundingClientRect();

    let rect1 = node1.getBoundingClientRect();
    let rect2 = node2.getBoundingClientRect();

    let x1 = rect1.left - graphRect.left + rect1.width / 2;
    let y1 = rect1.top - graphRect.top + rect1.height / 2;

    let x2 = rect2.left - graphRect.left + rect2.width / 2;
    let y2 = rect2.top - graphRect.top + rect2.height / 2;

    let line = document.createElementNS("http://www.w3.org/2000/svg", "line");

    line.setAttribute("x1", x1);
    line.setAttribute("y1", y1);
    line.setAttribute("x2", x2);
    line.setAttribute("y2", y2);

    line.setAttribute("stroke", "black");
    line.setAttribute("stroke-width", "2");

    document.getElementById("edges").appendChild(line);
}

function runAlgorithm() {
    let start = prompt("Enter start node:");
    
    if (start === null) return;
    
    start = parseInt(start);

    if (isNaN(start) || !graph[start]) {
        alert("Invalid start node");
        return;
    }

    let algo = document.getElementById("algorithm").value;

    if (algo === "bfs") {
        runBFS(start);
    } else if (algo === "dfs") {
        runDFS(start);
    } else if (algo === "dijkstra") {
        runDijkstra(start);
    }
}

function toggleControls(disable) {
    let buttons = document.querySelectorAll("button, select, input");

    buttons.forEach(el => {
        el.disabled = disable;
    });
}

//BFS
async function runBFS(start) {
    toggleControls(true);

    clearVisited();

    let visited = new Set();
    let queue = [];

    queue.push(start);
    visited.add(start);

    let result = [];

    while (queue.length > 0) {
        let node = queue.shift();

        highlightNode(node);
        result.push(node);

        await sleep(700);

        for (let edge of graph[node]) {
            let neighbor = edge.node;

            if (!visited.has(neighbor)) {
                visited.add(neighbor);
                queue.push(neighbor);
            }
        }
    }

    document.getElementById("result").innerText =
        "Traversal Order: " + result.join(" → ");

    toggleControls(false);
}

function highlightNode(node) {
    let nodes = document.getElementsByClassName("node");

    for (let n of nodes) {
        n.classList.remove("active");
    }

    nodes[node].classList.add("active");
    nodes[node].classList.add("visited");
}

function clearVisited() {
    let nodes = document.getElementsByClassName("node");
    for (let node of nodes) {
        node.classList.remove("visited");
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

//DFS
async function dfsHelper(node, visited, result) {

    visited.add(node);

    highlightNode(node);
    result.push(node);

    await sleep(700);

    for (let edge of graph[node]) {
        let neighbor = edge.node;
        if (!visited.has(neighbor)) {
            await dfsHelper(neighbor, visited, result);
        }
    }
}

async function runDFS(start) {
    toggleControls(true);

    clearVisited();

    let visited = new Set();
    let result = [];

    await dfsHelper(start, visited, result);

    document.getElementById("result").innerText =
        "Traversal Order: " + result.join(" → ");

    toggleControls(false);
}

//Dijkastra
async function runDijkstra(start) {
    toggleControls(true);

    clearVisited();

    let dist = {};
    let visited = new Set();

    for (let node in graph) {
        dist[node] = Infinity;
    }

    dist[start] = 0; // using passed start

    while (true) {
        let curr = -1;
        let minDist = Infinity;

        for (let node in dist) {
            if (!visited.has(parseInt(node)) && dist[node] < minDist) {
                minDist = dist[node];
                curr = parseInt(node);
            }
        }

        if (curr === -1) break;

        visited.add(curr);
        highlightNode(curr);

        await sleep(700);

        for (let edge of graph[curr]) {
            let neighbor = edge.node;
            let weight = edge.weight;

            if (dist[curr] + weight < dist[neighbor]) {
                dist[neighbor] = dist[curr] + weight;
            }
        }
    }

    document.getElementById("result").innerText =
        "Shortest distances: " + JSON.stringify(dist);

    toggleControls(false);
}

//clear graph
function clearGraph() {
    graph = {};
    nodeCount = 0;

    document.getElementById("graph").innerHTML = '<svg id="edges"></svg>';
    document.getElementById("result").innerText = "";
}