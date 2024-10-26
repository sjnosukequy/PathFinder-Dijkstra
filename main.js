var table = document.getElementById("table");
var range = document.getElementById("range");
var DropMenu = document.getElementById("dropdown-menu");
var DropLabel = document.getElementById("dropdown-label");
var ModeList = document.getElementById("mode-list");
var clear = document.getElementById("clear");
var start = document.getElementById("start");
var toast = document.getElementById('toast');
var maze = document.getElementById('maze');

// GLOBAL VARS
var mode_list = ["start", "finish", "wall"]
var mode_select = 0
var color = "#818cf8";
var r = document.querySelector(':root');
r.style.setProperty('--color', color);
var child_length = 10
var table_list = []
var isLClick = false
var isClick = false
var start_loco = [-1, -1]
var finish_loco = [-1, -1]
screenWidth = window.screen.width

// RESPONSIVE
if (screenWidth < 768) {
    range.setAttribute('max', '10')
}
else if (screenWidth < 1024) {
    range.setAttribute('max', '20')
}


// CLASS AND FUNCTIONS
class TableClass {
    constructor(x, y, value) {
        return {
            x: x,
            y: y,
            value: value,
            parent: null,
            index: x + y * child_length
        }
    }
}

function showToast(error, error_src) {
    toast.querySelector('h1').innerHTML = `${error_src}`
    toast.querySelector('p').innerHTML = error
    toast.classList.replace('hidden', 'flex')
    setTimeout(() => {
        toast.classList.replace('opacity-0', 'opacity-100')
    })
    setTimeout(() => {
        toast.classList.replace('opacity-100', 'opacity-0')
    }, 1000)
    setTimeout(() => {
        toast.classList.replace('flex', 'hidden')
    }, 1100)
}

function createGrid() {
    while (table.firstChild) {
        table.removeChild(table.firstChild)
    }
    table_list = []
    var x = 0
    var y = 0
    for (let i = 0; i < child_length * child_length; i++) {
        table_list.push(new TableClass(x, y, 'none'))
        var child = document.createElement("div")
        child.classList.add("box")
        child.setAttribute("x", x)
        child.setAttribute("y", y)
        child.addEventListener("mousedown", function (event) {
            event.preventDefault()
            x = parseInt(this.getAttribute("x"))
            y = parseInt(this.getAttribute("y"))
            button = event.button
            if (button == 0) {
                isClick = true
                table_select(this, x, y)
            }
            else if (button == 2) {
                isLClick = true
                table_deselect(this, x, y)
            }
        })
        child.addEventListener("contextmenu", function (event) {
            event.preventDefault()
        })
        child.addEventListener("mouseover", function (event) {
            event.preventDefault()
            x = parseInt(this.getAttribute("x"))
            y = parseInt(this.getAttribute("y"))
            if (isClick) {
                table_select(this, x, y)
            }
            if (isLClick) {
                table_deselect(this, x, y)
            }
        })
        table.appendChild(child)
        x += 1
        if (x > child_length - 1) {
            y += 1
            x = 0
        }
    }
}

function table_select(htmlElement, x, y) {
    // var htmlElement = document.querySelector("[x='" + x + "'][y='" + y + "']")
    if (mode_select == 0) {
        if (start_loco[0] != -1 && start_loco[1] != -1)
            return
        if (x == finish_loco[0] && y == finish_loco[1])
            return
        start_loco = [x, y]
    }
    else if (mode_select == 1) {
        if (finish_loco[0] != -1 && finish_loco[1] != -1)
            return
        if (x == start_loco[0] && y == start_loco[1])
            return
        finish_loco = [x, y]
    }
    else {
        if (x == start_loco[0] && y == start_loco[1])
            return
        if (x == finish_loco[0] && y == finish_loco[1])
            return
    }
    var index = x + y * child_length
    htmlElement.style.background = color
    table_list[index].value = mode_list[mode_select]
}

function table_deselect(htmlElement, x, y) {
    // var htmlElement = document.querySelector("[x='" + x + "'][y='" + y + "']")
    var index = x + y * child_length
    if (table_list[index].value == 'start')
        start_loco = [-1, -1]
    if (table_list[index].value == 'finish')
        finish_loco = [-1, -1]
    htmlElement.style.removeProperty("background")
    table_list[index].value = 'none'
}

function table_hover(x, y) {
    loco_x = x
    loco_y = y
}

function initMenu() {
    var children = DropMenu.children
    for (let i of children) {
        i.addEventListener("click", function () {
            changeMenu(this)
        })
    }
}

function changeMenu(htmlElement) {
    var text = htmlElement.querySelector("a").innerText
    console.log(text)
    DropLabel.innerText = text
}

function changeMode(index) {
    var children = ModeList.children
    children[mode_select].classList.remove("bg-base-300")
    children[index].classList.add("bg-base-300")
    mode_select = index
    elem = children[index].querySelector("div")
    style = getComputedStyle(elem)
    color = style.backgroundColor
    r.style.setProperty('--color', color);
}

function ModeInit() {
    var children = ModeList.children
    for (let i = 0; i < children.length; i++) {
        children[i].addEventListener("click", function () {
            changeMode(i)
        })
    }
}

// ALGORITHM SECTION
var oldPath = []
var oldVisited = {}
var wallVisited = {}

// CHILD FUNCTIONS
function getChildren(x, y) {
    // LEFT, RIGHT, UP, DOWN
    var children = []
    var left = false
    var right = false
    var up = false
    var down = false
    if (x - 1 >= 0) {
        let index = (x - 1) + y * child_length
        if (table_list[index].value != 'wall')
            children.push([x - 1, y, calDistance(x - 1, y), 'LEFT'])
        else
            left = true
    }
    if (x + 1 < child_length) {
        let index = (x + 1) + y * child_length
        if (table_list[index].value != 'wall')
            children.push([x + 1, y, calDistance(x + 1, y), 'RIGHT'])
        else
            right = true
    }
    if (y - 1 >= 0) {
        let index = x + (y - 1) * child_length
        if (table_list[index].value != 'wall')
            children.push([x, y - 1, calDistance(x, y - 1), 'UP'])
        else
            up = true
    }
    if (y + 1 < child_length) {
        let index = x + (y + 1) * child_length
        if (table_list[index].value != 'wall')
            children.push([x, y + 1, calDistance(x, y + 1), 'DOWN'])
        else
            down = true
    }


    if (x - 1 >= 0 && y + 1 < child_length && left == false && down == false) {
        let index = (x - 1) + (y + 1) * child_length
        if (table_list[index].value != 'wall')
            children.push([x - 1, y + 1, calDistance(x - 1, y + 1), 'LEFT_DOWN'])
    }
    if (x + 1 < child_length && y + 1 < child_length && right == false && down == false) {
        let index = (x + 1) + (y + 1) * child_length
        if (table_list[index].value != 'wall')
            children.push([x + 1, y + 1, calDistance(x + 1, y + 1), 'RIGHT_DOWN'])
    }
    if (x + 1 < child_length && y - 1 >= 0 && right == false && up == false) {
        let index = (x + 1) + (y - 1) * child_length
        if (table_list[index].value != 'wall')
            children.push([x + 1, y - 1, calDistance(x + 1, y - 1), 'RIGHT_UP'])
    }
    if (x - 1 >= 0 && y - 1 >= 0 && left == false && up == false) {
        let index = (x - 1) + (y - 1) * child_length
        if (table_list[index].value != 'wall')
            children.push([x - 1, y - 1, calDistance(x - 1, y - 1), 'LEFT_UP'])
    }

    return children
}
function calDistance(x1, y1) {
    return Math.sqrt(Math.pow(x1 - finish_loco[0], 2) + Math.pow(y1 - finish_loco[1], 2))
}
function getMazeChildren(x, y) {
    // LEFT, RIGHT, UP, DOWN
    var children = []
    if (x - 1 >= 0) {
        let index = (x - 1) + y * child_length
        if (!(index in wallVisited))
            children.push({
                x: x - 1,
                y: y,
                wall: false
            })
    }
    if (x + 1 < child_length) {
        let index = (x + 1) + y * child_length
        if (!(index in wallVisited))
            children.push({
                x: x + 1,
                y: y,
                wall: false
            })
    }
    if (y - 1 >= 0) {
        let index = x + (y - 1) * child_length
        if (!(index in wallVisited))
            children.push({
                x: x,
                y: y - 1,
                wall: false
            })
    }
    if (y + 1 < child_length) {
        let index = x + (y + 1) * child_length
        if (!(index in wallVisited))
            children.push({
                x: x,
                y: y + 1,
                wall: false
            })
    }

    var length_maze = children.length

    // if (x - 1 >= 0 && y + 1 < child_length) {
    //     let index = (x - 1) + (y + 1) * child_length
    //     if (!table_list[index].wall)
    //         children.push({
    //             x: x - 1,
    //             y: y + 1,
    //             wall: true
    //         })
    // }
    // if (x + 1 < child_length && y + 1 < child_length) {
    //     let index = (x + 1) + (y + 1) * child_length
    //     if (!table_list[index].wall)
    //         children.push({
    //             x: x + 1,
    //             y: y + 1,
    //             wall: true
    //         })
    // }
    // if (x + 1 < child_length && y - 1 >= 0) {
    //     let index = (x + 1) + (y - 1) * child_length
    //     if (!table_list[index].wall)
    //         children.push({
    //             x: x + 1,
    //             y: y - 1,
    //             wall: true
    //         })
    // }
    // if (x - 1 >= 0 && y - 1 >= 0) {
    //     let index = (x - 1) + (y - 1) * child_length
    //     if (!table_list[index].wall)    
    //         children.push({
    //             x: x - 1,
    //             y: y - 1,
    //             wall: true
    //         })
    // }

    return { children, length_maze }
}

// RENDERING FUNCTIONS
function renderPath(path) {
    oldPath = path
    for (let i = 0; i < path.length; i++) {
        var htmlElement = document.querySelector("[x='" + path[i]['x'] + "'][y='" + path[i]['y'] + "']")
        htmlElement.style.backgroundColor = "#4ade80"
    }
}
function removeOldPath() {
    for (let i = 0; i < oldPath.length; i++) {
        if (table_list[oldPath[i]['index']].value == 'none') {
            var htmlElement = document.querySelector("[x='" + oldPath[i]['x'] + "'][y='" + oldPath[i]['y'] + "']")
            htmlElement.style.removeProperty("background-color")
        }
    }
}
function renderVisited(visited) {
    var keys = Object.keys(visited)
    for (let i = 0; i < keys.length; i++) {
        if (table_list[visited[keys[i]]['index']].value == 'none') {
            var htmlElement = document.querySelector("[x='" + visited[keys[i]]['x'] + "'][y='" + visited[keys[i]]['y'] + "']")
            htmlElement.style.backgroundColor = "#fcd34d"
        }
    }
    oldVisited = visited
}
function removeOldVisited() {
    var keys = Object.keys(oldVisited)
    for (let i = 0; i < keys.length; i++) {
        if (table_list[oldVisited[keys[i]]['index']].value == 'none') {
            var htmlElement = document.querySelector("[x='" + oldVisited[keys[i]]['x'] + "'][y='" + oldVisited[keys[i]]['y'] + "']")
            htmlElement.style.removeProperty("background-color")
        }
    }
}
function renderWall(visited) {
    var keys = Object.keys(visited)
    for (let i = 0; i < keys.length; i++) {
        if (table_list[visited[keys[i]]['index']].value == 'none' && visited[keys[i]]['wall'] == true) {
            var htmlElement = document.querySelector("[x='" + visited[keys[i]]['x'] + "'][y='" + visited[keys[i]]['y'] + "']")
            htmlElement.style.backgroundColor = "#9ca3af"
            table_list[visited[keys[i]]['index']].value = "wall"
        }
    }
}

// PATH FINDING ALGORITHM
function BFS() {
    if (start_loco[0] == -1 || start_loco[1] == -1 || finish_loco[0] == -1 || finish_loco[1] == -1) {
        showToast("Please set start and finish", "Start and Finish")
        return
    }
    var queue = []
    var visited = {}
    var current_pos = start_loco[0] + start_loco[1] * child_length
    var final_path = []
    queue.push(table_list[current_pos])
    visited[current_pos] = table_list[current_pos]
    while (queue.length > 0) {
        var current = queue.shift()
        if (current.value == 'finish') {
            var backTrackObj = current
            while (backTrackObj.value != 'start') {
                backTrackObj = backTrackObj.parent
                final_path.push({
                    x: backTrackObj.x,
                    y: backTrackObj.y,
                    index: backTrackObj.index
                })
            }
            final_path.splice(final_path.length - 1, 1)
            renderVisited(visited)
            renderPath(final_path)
            // showToast("Success", "BFS")
            return
        }
        var children = getChildren(current.x, current.y)
        for (let i of children) {
            var index = i[0] + i[1] * child_length
            if (!visited[index]) {
                var obj = table_list[index]
                obj.parent = current
                visited[index] = obj
                queue.push(obj)
            }
        }
    }
    showToast("Cannot find path", "Fail")
}
function DFS() {
    if (start_loco[0] == -1 || start_loco[1] == -1 || finish_loco[0] == -1 || finish_loco[1] == -1) {
        showToast("Please set start and finish", "Start and Finish")
        return
    }
    var queue = []
    var visited = {}
    var current_pos = start_loco[0] + start_loco[1] * child_length
    var final_path = []
    queue.push(table_list[current_pos])
    visited[current_pos] = table_list[current_pos]
    while (queue.length > 0) {
        var current = queue.shift()
        if (current.value == 'finish') {
            var backTrackObj = current
            while (backTrackObj.value != 'start') {
                backTrackObj = backTrackObj.parent
                final_path.push({
                    x: backTrackObj.x,
                    y: backTrackObj.y,
                    index: backTrackObj.index,
                })
            }
            final_path.splice(final_path.length - 1, 1)
            renderVisited(visited)
            renderPath(final_path)
            // showToast("Success", "BFS")
            return
        }
        var children = getChildren(current.x, current.y)
        for (let i of children) {
            var index = i[0] + i[1] * child_length
            if (!visited[index]) {
                var obj = table_list[index]
                obj.parent = current
                visited[index] = obj
                queue.unshift(obj)
            }
        }
    }
    showToast("Cannot find path", "Fail")
}
function Dijkstra() {
    if (start_loco[0] == -1 || start_loco[1] == -1 || finish_loco[0] == -1 || finish_loco[1] == -1) {
        showToast("Please set start and finish", "Start and Finish")
        return
    }
    var queue = []
    var visited = {}
    var current_pos = start_loco[0] + start_loco[1] * child_length
    var final_path = []
    queue.push(table_list[current_pos])
    visited[current_pos] = table_list[current_pos]
    while (queue.length > 0) {
        var current = queue.shift()
        if (current.value == 'finish') {
            var backTrackObj = current
            while (backTrackObj.value != 'start') {
                backTrackObj = backTrackObj.parent
                final_path.push({
                    x: backTrackObj.x,
                    y: backTrackObj.y,
                    index: backTrackObj.index
                })
            }
            final_path.splice(final_path.length - 1, 1)
            renderVisited(visited)
            renderPath(final_path)
            // showToast("Success", "BFS")
            return
        }
        var children = getChildren(current.x, current.y)
        for (let i of children) {
            var index = i[0] + i[1] * child_length
            if (!visited[index]) {
                var obj = table_list[index]
                obj.parent = current
                visited[index] = obj
                queue.push(obj)
                queue.sort(function (a, b) {
                    return a[2] - b[2]
                })
            }
        }
    }
    renderVisited(visited)
    showToast("Cannot find path", "Fail")
}
function mazeGenerator() {
    // var cells = JSON.parse(JSON.stringify(table_list))
    var visited = {}
    var current_pos = 0
    var queue = []
    var obj = table_list[current_pos]
    obj.wall = false
    queue.push(obj)
    visited[current_pos] = obj
    while (queue.length > 0) {
        var current = queue.shift()
        current_pos = current.x + current.y * child_length
        let keys = Object.keys(visited)
        if (keys.length == child_length * child_length) {
            visited[current_pos].wall = false
            renderWall(visited)
            return
        }
        var children = getMazeChildren(current.x, current.y)
        var random_idx = Math.floor(Math.random() * children['length_maze'])
        // console.log(random_idx, children['length_maze'])
        var children2 = children['children']
        var now_obj = null
        for (let i in children2) {
            var index = children2[i].x + children2[i].y * child_length
            if (!visited[index]) {
                var obj = table_list[index]
                if (i == random_idx) {
                    now_obj = table_list[index]
                    now_obj.wall = false
                    // table_list[index].wall = false
                }
                else {
                    obj.wall = true
                    queue.push(obj)
                    // table_list[index].wall = true
                }
                visited[index] = obj
            }
        }
        if (now_obj != null) {
            queue.unshift(now_obj)
            visited[current_pos].wall = false
        }
        wallVisited = visited
        // console.log(now_obj, current, children2, random_idx)
    }
}


// MAIN
ModeInit()
// initMenu()
createGrid()


// EVENT
table.addEventListener("mousedown", function (event) {
    event.preventDefault()
    button = event.button
    if (button == 0) {
        isClick = true
    }
    else if (button == 2) {
        isLClick = true
    }
})
table.addEventListener("mouseup", function (event) {
    event.preventDefault()
    button = event.button
    if (button == 0) {
        isClick = false
    }
    else if (button == 2) {
        isLClick = false
    }
})
document.addEventListener("contextmenu", function (event) {
    event.preventDefault()
})
table.addEventListener("mouseleave", function (event) {
    event.preventDefault()
    isClick = false
    isLClick = false
})

clear.addEventListener("click", function () {
    table_list = []
    start_loco = [-1, -1]
    finish_loco = [-1, -1]
    createGrid()
})
start.addEventListener("click", function () {
    if (start_loco[0] == -1 || start_loco[1] == -1 || finish_loco[0] == -1 || finish_loco[1] == -1) {
        showToast("Please set start and finish", "Start and Finish")
        return
    }
    removeOldVisited()
    removeOldPath()
    // if (DropLabel.innerText == "BFS") {
    //     BFS()
    // }
    // else if (DropLabel.innerText == "DFS") {
    //     DFS()
    // }
    // else if (DropLabel.innerText == "Dijkstra") {
    //     Dijkstra()
    // }
    // else {
    //     showToast("Please select algorithm", "Algorithm")
    // }
    Dijkstra()
})
document.addEventListener("keydown", function (event) {
    event.preventDefault()
    if (event.key == " " || event.key == "Enter") {
        if (start_loco[0] == -1 || start_loco[1] == -1 || finish_loco[0] == -1 || finish_loco[1] == -1) {
            showToast("Please set start and finish", "Start and Finish")
            return
        }
        removeOldVisited()
        removeOldPath()
        Dijkstra()
    }
})

maze.addEventListener("click", function () {
    table_list = []
    start_loco = [-1, -1]
    finish_loco = [-1, -1]
    wallVisited = {}
    oldPath = []
    oldVisited = {}
    wallVisited = {}
    createGrid()
    mazeGenerator()
})

range.oninput = function () {
    var value = parseInt(range.value)
    child_length = value
    table.style.gridTemplateColumns = `repeat(${value}, minmax(0, 1fr))`
    table.style.gridTemplateRows = `repeat(${value}, minmax(0, 1fr))`
    table_list = []
    start_loco = [-1, -1]
    finish_loco = [-1, -1]
    createGrid()
}
document.addEventListener("wheel", (event) => {
    event.preventDefault()
    if (event.deltaY > 0) {
        let index = (mode_select + 1) % mode_list.length
        changeMode(index)
    } else {
        let index = Math.abs((mode_select - 1 + mode_list.length) % mode_list.length)
        changeMode(index)
    }
}, { passive: false })