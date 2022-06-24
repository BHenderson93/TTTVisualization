const canvas = document.getElementById('canvas')
const pencil = canvas.getContext('2d')
const screenScale = Math.min(window.innerHeight * .85, window.innerWidth * .6)
pencil.canvas.width = screenScale
pencil.canvas.height = screenScale
pencil.fillStyle = 'black';
pencil.fillRect(0, 0, canvas.width, canvas.height)
const xOrigin = canvas.width / 2
const yOrigin = canvas.height / 2

let lineCount = 0

class recursiveGameNode {
    constructor(path, x, y, arcBound, offsetRadians, radiusIncrement, radiusOffset, maxTreeSize, parent) {
        this.path = path
        this.remainingNums = [1, 2, 3, 4, 5, 6, 7, 8, 9]
        this.childPaths = []
        this.children = []
        this.x = x
        this.y = y
        this.arcBound = arcBound
        this.offsetRadians = offsetRadians
        this.radiusIncrement = radiusIncrement
        this.radiusOffset = radiusOffset
        this.radius = (this.path.length - this.radiusOffset) * this.radiusIncrement
        this.xOrigin = xOrigin
        this.yOrigin = yOrigin
        this.nodeColor = 'white'
        this.totalNodes = 1
        this.maxTreeSize = maxTreeSize
        this.parent = parent

        this.determineScoresAndDecisiveColor()

        if (!this.xWin && !this.oWin && !this.tie) {
            this.generateChildPaths()
            this.generateChildren()
            this.determineColorByNodeScore()
            this.detectForcedXVariations()
            this.detectForcedOVariations()
            this.determineBestXLine()
            this.determineBestOLine()

        }
    }



    determineScoresAndDecisiveColor() {

        this.ids = { 1: [1, 0, 0, 1, 0, 0, 1, 0], 2: [0, 1, 0, 1, 0, 0, 0, 0], 3: [0, 0, 1, 1, 0, 0, 0, 1], 4: [1, 0, 0, 0, 1, 0, 0, 0], 5: [0, 1, 0, 0, 1, 0, 1, 1], 6: [0, 0, 1, 0, 1, 0, 0, 0], 7: [1, 0, 0, 0, 0, 1, 0, 1], 8: [0, 1, 0, 0, 0, 1, 0, 0], 9: [0, 0, 1, 0, 0, 1, 1, 0] }
        this.xScore = [0, 0, 0, 0, 0, 0, 0, 0]
        this.oScore = [0, 0, 0, 0, 0, 0, 0, 0]
        this.xWin = false
        this.xWinForced = false
        this.oWin = false
        this.oWinForced = false
        this.tie = false
        this.xWinTally = 0
        this.oWinTally = 0
        this.tieTally = 0
        this.resultTally = 0
        this.nodeScore = 0

        for (let i = 0; i < this.path.length; i++) {
            if (i % 2 === 0) {
                for (let j = 0; j < 8; j++) {
                    this.xScore[j] += this.ids[this.path[i]][j]
                }
            } else {
                for (let j = 0; j < 8; j++) {
                    this.oScore[j] += this.ids[this.path[i]][j]
                }
            }
        }

        if (this.xScore.includes(3)) {
            this.xWin = true
            this.xWinTally++
            this.xWinForced = true
            this.resultTally++
            this.nodeColor = `rgba(255,0,0,1)`
            this.nodeScore++

        } else if (this.oScore.includes(3)) {
            this.oWin = true
            this.oWinTally++
            this.oWinForced = true
            this.resultTally++
            this.nodeColor = `rgba(0,0,255,1)`
            this.nodeScore--

        } else if (this.path.length === 9 && !this.xWin && !this.oWin) {
            this.tie = true
            this.tieTally++
            this.resultTally++
            this.nodeColor = `rgba(0,255,0,1)`
        }


    }

    detectForcedXVariations() {
        const currMove = this.path.length % 2
        if (currMove === 0) {
            for (let child of this.children) {
                if (child.xWinForced) {
                    this.xWinForced = true
                }
            }
        } else {
            let counter = 0
            for (let child of this.children) {
                if (child.xWinForced) {
                    counter++
                }
            }
            if (counter === this.children.length) {
                this.xWinForced = true
            }
        }
    }

    detectForcedOVariations() {

        const currMove = this.path.length % 2

        if (currMove === 1) {
            for (let child of this.children) {
                if (child.oWinForced) {
                    this.oWinForced = true
                }
            }
        } else {
            let counter = 0
            for (let child of this.children) {
                if (child.oWinForced) {
                    counter++
                }
            }
            if (counter === this.children.length) {
                this.oWinForced = true
            }
        }
    }

    updateSelfWithChildScores(child) {
        this.totalNodes += child.totalNodes
        this.nodeScore += child.nodeScore
        this.xWinTally += child.xWinTally
        this.oWinTally += child.oWinTally
        this.tieTally += child.tieTally
        this.resultTally += child.resultTally
        this.drawnTotalNodes += child.drawnTotalNodes
    }

    determineColorByNodeScore() {

        let red = (this.xWinTally / this.resultTally) * 255
        let green = (this.tieTally / this.resultTally) * 255
        let blue = (this.oWinTally / this.resultTally) * 255
        this.nodeColor = `rgb(${red}, ${green}, ${blue})`
    }

    determineBestXLine() {
        let bestMove = false
        for (let child of this.children) {
            if (child.xWinForced) {
                bestMove = child
            }
        }

        if (!bestMove) {
            let bestChildren = this.children.filter((child) => !child.oWinForced)

            if (bestChildren.length > 0) {
                bestMove = bestChildren[0]
                for (let child of bestChildren) {
                    if (child.nodeScore > bestMove.nodeScore) {
                        bestMove = child
                    }
                }
            } else {
                bestMove = this.children[0]
                for (let child of this.children) {
                    if (child.nodeScore > bestMove.nodeScore) {
                        bestMove = child
                    }
                }
            }
        }
        this.bestXMove = bestMove.path
    }

    determineBestOLine() {
        let bestMove = false
        for (let child of this.children) {
            if (child.oWinForced) {
                bestMove = child
            }
        }

        if (!bestMove) {
            let bestChildren = this.children.filter((child) => !child.xWinForced)

            if (bestChildren.length > 0) {
                bestMove = bestChildren[0]
                for (let child of bestChildren) {
                    if (child.nodeScore < bestMove.nodeScore) {
                        bestMove = child
                    }
                }
            } else {
                bestMove = this.children[0]
                for (let child of this.children) {
                    if (child.nodeScore < bestMove.nodeScore) {
                        bestMove = child
                    }
                }
            }
        }
        this.bestOMove = bestMove.path
    }

    generateChildPaths() {
        for (let num of this.path) {
            this.remainingNums.splice(this.remainingNums.indexOf(num), 1)
        }

        for (let num of this.remainingNums) {
            let currPath = this.path.slice()
            currPath.push(num)
            this.childPaths.push(currPath)
        }
    }

    generateChildren() {
        const childArcBound = this.arcBound / this.childPaths.length
        const childRadiusIncrement = this.radiusIncrement
        const childRadius = this.radius + this.radiusIncrement
        const childArcLength = (childArcBound / (2)) * childRadius

        let childCount = 0

        for (let childPath of this.childPaths) {
            const childOffsetRadians = (childArcBound * childCount) + this.offsetRadians
            const childX = (Math.sin(childOffsetRadians + (childArcBound / 2)) * childRadius) + xOrigin
            const childY = (Math.cos(childOffsetRadians + (childArcBound / 2)) * childRadius * -1) + yOrigin
            const myChild = new recursiveGameNode(childPath, childX, childY, childArcBound, childOffsetRadians, childRadiusIncrement, this.radiusOffset, this.maxTreeSize, this)
            this.updateSelfWithChildScores(myChild)
            this.children.push(myChild)
            childCount++
        }
    }

    drawLinesToChildren(color) {
        for (let child of this.children) {
            if (color) {
                pencil.strokeStyle = color
            } else {
                pencil.strokeStyle = child.nodeColor
            }
            pencil.lineWidth = this.radius === 0 ? (this.arcBound / 16) * this.radiusIncrement * .2 : (this.arcBound / 16) * this.radius
            pencil.lineWidth > (currentNode.arcBound / 16) * this.radiusIncrement * .2 ? pencil.lineWidth=(currentNode.arcBound / 16) * this.radiusIncrement * .15 : null
            pencil.beginPath()
            pencil.moveTo(this.x, this.y)
            pencil.lineTo(child.x, child.y)
            pencil.stroke()
        }
    }

    drawLineToParent(color) {
        pencil.strokeStyle = color
        let maxWidth = ((currentNode.arcBound) / 16) * this.radiusIncrement * .2
        if ((this.radius - this.radiusIncrement) === 0 || !this.parent) {
            if (!this.parent) {
                pencil.lineWidth = ((this.arcBound) / 16) * this.radiusIncrement * .2
                this.parent.x = this.x
                this.parent.y = this.y
            } else {
                pencil.lineWidth = ((this.parent.arcBound) / 16) * this.radiusIncrement * .2
            }

        } else {
            pencil.lineWidth = ((this.parent.arcBound) / 16) * (this.radius - this.radiusIncrement)
            pencil.lineWidth > maxWidth ? pencil.lineWidth = maxWidth : null
        }
        pencil.beginPath()
        pencil.moveTo(this.x, this.y)
        pencil.lineTo(this.parent.x, this.parent.y)
        pencil.stroke()
        return
    }

    drawNodeCircle(xStart, yStart, radius) {
        pencil.fillStyle = this.nodeColor
        pencil.beginPath()
        pencil.arc(xStart, yStart, radius, 0, 2 * Math.PI)
        pencil.fill()
    }

    drawForcedVariationCircle(xStart, yStart, radius) {
        if (this.xWinForced) {
            pencil.fillStyle = `rgb(255,0,0)`
            pencil.beginPath()
            pencil.arc(xStart, yStart, radius, 0, 2 * Math.PI)
            pencil.fill()
        } else if (this.oWinForced) {
            pencil.fillStyle = `rgb(0,0,255)`
            pencil.beginPath()
            pencil.arc(xStart, yStart, radius, 0, 2 * Math.PI)
            pencil.fill()
        }
    }

    clearLines() {
        pencil.strokeStyle = 'rgba(0,0,0,1)'
        if ((this.radius - this.radiusIncrement) === 0 || !this.parent) {
            if (!this.parent) {
                pencil.lineWidth = ((this.arcBound) / 16) * this.radiusIncrement * .2
                this.parent.x = this.x
                this.parent.y = this.y
            } else {
                pencil.lineWidth = ((this.parent.arcBound) / 16) * this.radiusIncrement * .2
            }

        } else {
            pencil.lineWidth = ((this.parent.arcBound) / 16) * (this.radius - this.radiusIncrement)
        }
        pencil.lineWidth *= 2.5
        pencil.globalCompositeOperation = "xor";
        pencil.beginPath()
        pencil.moveTo(this.x, this.y)
        pencil.lineTo(this.parent.x, this.parent.y)
        pencil.stroke()
        pencil.globalCompositeOperation = "source-over";
    }

    clearCircles(xStart, yStart, radius) {
        pencil.fillStyle = 'black'
        pencil.globalCompositeOperation = "xor";
        pencil.beginPath()
        pencil.arc(xStart, yStart, radius * 1.1, 0, 2 * Math.PI)
        pencil.fill()
        pencil.globalCompositeOperation = "source-over";
    }
}

const findGameNode = (gameTree, pathArray) => {
    let currentChild = gameTree

    for (let i = 0; i < pathArray.length; i++) {
        let isPossible = false
        for (let child of currentChild.children) {

            if (child.path[i] === pathArray[i]) {
                currentChild = child
                isPossible = true
            }
        }
        if (!isPossible) {
            return false
        }
    }
    return currentChild
}

const resetBoard = () => {
    currentNode = new recursiveGameNode(testArray, xOrigin, yOrigin, 2 * Math.PI, 0, baseRadius, radOffset, testArray.length + viewDepth, { x: ' ' })
    drawGameNode(currentNode)
    currentPath = []
    for (let i = 1; i < 10; i++) {
        let tile = document.getElementById(i)
        tile.classList.remove('marked')
        tile.innerText = ''
    }
}

const drawGameNode = (gameNode) => {

    clearAnimationIntervals()

    pencil.fillStyle = 'black';
    pencil.fillRect(0, 0, canvas.width, canvas.height)

    const recursiveDraw = (node) => {
        if (node.path.length < node.maxTreeSize) {
            if (iFVClosed && (node.xWinForced || node.oWinForced)) {
                node.drawForcedVariationCircle(node.x, node.y, node.radius === 0 ? (node.radiusIncrement / 2) : (node.arcBound / 4) * node.radius)
                node.drawNodeCircle(node.x, node.y, node.radius === 0 ? (node.radiusIncrement / 3) : (node.arcBound / 8) * node.radius)
            } else if (iFV) {
                node.drawLinesToChildren()
                node.drawForcedVariationCircle(node.x, node.y, node.radius === 0 ? (node.radiusIncrement / 2) : (node.arcBound / 4) * node.radius)
                node.drawNodeCircle(node.x, node.y, node.radius === 0 ? (node.radiusIncrement / 3) : (node.arcBound / 8) * node.radius)
            } else if (iNodesColorized) {
                node.drawLinesToChildren()
                node.drawNodeCircle(node.x, node.y, node.radius === 0 ? (node.radiusIncrement / 3) : (node.arcBound / 8) * node.radius)
            } else if (iLinesColorized) {
                node.drawLinesToChildren()
                if (node.xWin || node.oWin || node.tie) {
                    node.drawNodeCircle(node.x, node.y, node.radius === 0 ? (node.radiusIncrement / 3) : (node.arcBound / 8) * node.radius)
                }
            } else if (iNodes) {
                node.drawLinesToChildren('white')
                if (node.xWin || node.oWin || node.tie) {
                    node.drawNodeCircle(node.x, node.y, node.radius === 0 ? (node.radiusIncrement / 3) : (node.arcBound / 8) * node.radius)
                }
            } else {
                node.drawLinesToChildren('white')
            }

        } else {
            if (node.path.length < node.maxTreeSize + 1) {
                if (iNodes && (node.xWin || node.oWin || node.tie)) {
                    node.drawForcedVariationCircle(node.x, node.y, node.radius === 0 ? (node.radiusIncrement / 2) : (node.arcBound / 4) * node.radius)
                    node.drawNodeCircle(node.x, node.y, node.radius === 0 ? (node.radiusIncrement / 3) : (node.arcBound / 8) * node.radius)
                }else if (iNodes && iFV){
                    node.drawForcedVariationCircle(node.x, node.y, node.radius === 0 ? (node.radiusIncrement / 2) : (node.arcBound / 4) * node.radius)
                    node.drawNodeCircle(node.x, node.y, node.radius === 0 ? (node.radiusIncrement / 3) : (node.arcBound / 8) * node.radius)
                }
            }
        }
        if (iFVClosed) {
            for (let child of node.children) {
                if (!node.xWinForced && !node.oWinForced) {
                    recursiveDraw(child)
                }
            }
        } else {
            for (let child of node.children) {
                recursiveDraw(child)
            }
        }
    }
    recursiveDraw(gameNode)
}

let nodeList
let iLines, iNodes, iLinesColorized, iNodesColorized, iFV, iFVClosed, redraw, redraw2
let linesAnimation, nodesAnimation, linesColorizedAnimation, nodesColorizedAnimation, fvAnimation, fvClosedAnimation, redrawAnimation, redraw2Animation
const clearAnimationIntervals = () => {
    let Null = [linesAnimation, nodesAnimation, linesColorizedAnimation, nodesColorizedAnimation, fvAnimation, fvClosedAnimation, redrawAnimation, redraw2Animation]

    for (let Undefined of Null) {
        clearInterval(Undefined)
        clearTimeout(Undefined)
    }
}

const animateGameNode = (gameNode) => {
    clearAnimationIntervals()

    pencil.fillStyle = 'black';
    pencil.fillRect(0, 0, canvas.width, canvas.height)
    nodeList = [gameNode]

    const addListNodes = (node) => {
        for (let child of node.children) {
            if (child.path.length <= child.maxTreeSize) {
                nodeList.push(child)
                addListNodes(child)
            }
        }
    }

    addListNodes(gameNode)
    let maxTicks = animationLength / 4
    let itersPerTick = Math.ceil(nodeList.length / maxTicks)
    let timePerTick = Math.ceil(animationLength / nodeList.length)
    let synchronizer = 500
    let buffer = 250
    let index = -1
    if (iLines) {
        linesAnimation = setTimeout(() => {
            linesAnimation = setInterval(() => {
                let iter = 0
                while (iter < itersPerTick) {
                    iter++
                    index++

                    if (!nodeList || index === nodeList.length) {
                        clearInterval(linesAnimation)
                        break
                    }
                    let node = nodeList[index]
                    node.drawLineToParent('white')
                }
            }, timePerTick)
        }, synchronizer)
        synchronizer += animationLength + buffer
    }

    let index2 = -1
    if (iNodes) {
        nodesAnimation = setTimeout(() => {
            nodesAnimation = setInterval(() => {
                let iter = 0
                while (iter < itersPerTick) {
                    iter++
                    index2++

                    if (!nodeList || index2 === nodeList.length) {
                        clearInterval(nodesAnimation)
                        break
                    }
                    let node = nodeList[index2]
                    if (node.xWin || node.oWin || node.tie) {
                        node.drawNodeCircle(node.x, node.y, node.radius === 0 ? (node.radiusIncrement / 3) : (node.arcBound / 8) * node.radius, node.nodeColor)
                    }
                }
            }, timePerTick)
        }, synchronizer)
        synchronizer += animationLength + buffer
    }

    const redrawColorizedLines = (node) => {
        if (node.path.length < node.maxTreeSize) {
            node.drawLinesToChildren()
        }

        if ((node.xWin || node.oWin || node.tie) && node.path.length < node.maxTreeSize + 1) {
            node.drawNodeCircle(node.x, node.y, node.radius === 0 ? (node.radiusIncrement / 3) : (node.arcBound / 8) * node.radius)
        }

        for (let child of node.children) {
            redrawColorizedLines(child)
        }
    }

    let index3 = nodeList.length
    if (iLinesColorized) {
        linesColorizedAnimation = setTimeout(() => {
            linesColorizedAnimation = setInterval(() => {
                let iter = 0
                while (iter < itersPerTick) {
                    iter++
                    index3--

                    if (!nodeList || index3 === -1) {
                        clearInterval(linesColorizedAnimation)
                        break
                    }

                    let node = nodeList[index3]
                    node.clearLines()
                    node.drawLineToParent(node.nodeColor)
                    if (node.xWin || node.oWin || node.tie) {
                        node.drawNodeCircle(node.x, node.y, node.radius === 0 ? (node.radiusIncrement / 3) : (node.arcBound / 8) * node.radius)
                    }
                }
            }, timePerTick)
        }, synchronizer)

        synchronizer += animationLength + buffer
        redraw2Animation = setTimeout(() => {
            pencil.fillStyle = 'black';
            pencil.fillRect(0, 0, canvas.width, canvas.height)
            redrawColorizedLines(gameNode)
        }, synchronizer + 500)
        synchronizer += 1500
    }

    index4 = -1
    if (iNodesColorized) {
        nodesColorizedAnimation = setTimeout(() => {
            nodesColorizedAnimation = setInterval(() => {
                let iter = 0
                while (iter < itersPerTick) {
                    iter++
                    index4++

                    if (!nodeList || index4 === nodeList.length) {
                        clearInterval(nodesColorizedAnimation)
                        break
                    }

                    let node = nodeList[index4]
                    node.drawNodeCircle(node.x, node.y, node.radius === 0 ? (node.radiusIncrement / 3) : (node.arcBound / 8) * node.radius, node.nodeColor)

                }
            }, timePerTick)
        }, synchronizer)
        synchronizer += animationLength + buffer
    }

    index5 = nodeList.length
    if (iFV) {
        fvAnimation = setTimeout(() => {
            fvAnimation = setInterval(() => {
                let iter = 0
                while (iter < itersPerTick) {
                    iter++
                    index5--

                    if (!nodeList || index5 === -1) {
                        clearInterval(fvAnimation)
                        break
                    }

                    let node = nodeList[index5]
                    node.drawForcedVariationCircle(node.x, node.y, node.radius === 0 ? (node.radiusIncrement / 2) : (node.arcBound / 4) * node.radius)
                    node.drawNodeCircle(node.x, node.y, node.radius === 0 ? (node.radiusIncrement / 3) : (node.arcBound / 8) * node.radius)

                }
            }, timePerTick)
        }, synchronizer)
        synchronizer += animationLength + buffer
    }

    index6 = -1
    let fvLogic = { display: true, pathLength: 10 }
    if (iFVClosed) {
        fvClosedAnimation = setTimeout(() => {
            fvClosedAnimation = setInterval(() => {

                let iter = 0
                while (iter < itersPerTick) {
                    iter++
                    index6++

                    if (!nodeList || index6 === nodeList.length) {
                        clearInterval(fvClosedAnimation)
                        break
                    }

                    let node = nodeList[index6]
                    if (node.path.length <= fvLogic.pathLength) {
                        if (node.xWinForced || node.oWinForced) {
                            fvLogic.display = false
                            fvLogic.pathLength = node.path.length
                            fvLogic.node = node
                        } else {
                            fvLogic.display = true
                            fvLogic.pathLength = 10
                        }
                    } else if (!fvLogic.display) {
                        node.clearLines()
                        node.clearCircles(node.x, node.y, node.radius === 0 ? (node.radiusIncrement / 2) : (node.arcBound / 4) * node.radius)
                        if (node.parent.path === fvLogic.node.path) {
                            node.parent.drawForcedVariationCircle(node.parent.x, node.parent.y, node.parent.radius === 0 ? (node.parent.radiusIncrement / 2) : (node.parent.arcBound / 4) * node.parent.radius)
                            node.parent.drawNodeCircle(node.parent.x, node.parent.y, node.parent.radius === 0 ? (node.parent.radiusIncrement / 3) : (node.parent.arcBound / 8) * node.parent.radius)
                        }
                    }
                }
            }, timePerTick)
        }, synchronizer)
        synchronizer += animationLength * 1.2
    }

    redrawAnimation = setTimeout(() => {
        pencil.fillStyle = 'black';
        pencil.fillRect(0, 0, canvas.width, canvas.height)
        drawGameNode(gameNode)
    }, synchronizer)
}

const undoMove = (headNode) => {
    if(currentPath.length===0){
        console.log('no path')
        return
    }
    let removedNode = document.getElementById(currentPath.pop())
    removedNode.innerText=''
    removedNode.classList.remove('marked')
    currentNode = makeIntermediateNode(findGameNode(headNode, currentPath))
    drawGameNode(currentNode)
    return
}

const redoMove = (headNode) => {
    if (currentPath.length === pathCopy.length) {
        return "No moves to redo. Currently up to date."
    } else {
        let addedNode = document.getElementById(pathCopy[currentPath.length])
        currentPath.push(pathCopy[currentPath.length])
        addedNode.innerText = currentPath.length % 2 === 1 ? 'X' : 'O'
        addedNode.classList.add('marked')
        currentNode = makeIntermediateNode(findGameNode(headNode, currentPath))
        drawGameNode(currentNode)
    }
    return
}

const makeIntermediateNode = (gameNode) => {
    if (gameNode.path.length === 0) {
        lineCount = 0
        return treeHead
    } else {
        lineCount = 0
        return new recursiveGameNode(gameNode.path, xOrigin, yOrigin, 2 * Math.PI, 0, baseRadius, gameNode.path.length, gameNode.path.length + viewDepth, { x: ' ' })
    }
}

const onlyLines = () => {
    iLines = true
    iNodes = false
    iLinesColorized = false
    iNodesColorized = false
    iFV = false
    iFVClosed = false
    clearAnimationIntervals()
    drawGameNode(currentNode)
}

const displayDecisive = () => {
    iLines = true
    iNodes = true
    iLinesColorized = false
    iNodesColorized = false
    iFV = false
    iFVClosed = false
    clearAnimationIntervals()
    drawGameNode(currentNode)
}

const colorizeLines = () => {
    iLines = true
    iNodes = true
    iLinesColorized = true
    iNodesColorized = false
    iFV = false
    iFVClosed = false
    clearAnimationIntervals()
    drawGameNode(currentNode)
}

const colorizeNodes = () => {
    iLines = true
    iNodes = true
    iLinesColorized = true
    iNodesColorized = true
    iFV = false
    iFVClosed = false
    clearAnimationIntervals()
    drawGameNode(currentNode)
}

const showForced = () => {
    iLines = true
    iNodes = true
    iLinesColorized = true
    iNodesColorized = true
    iFV = true
    iFVClosed = false
    clearAnimationIntervals()
    drawGameNode(currentNode)
}

const closeForced = () => {
    iLines = true
    iNodes = true
    iLinesColorized = true
    iNodesColorized = true
    iFV = true
    iFVClosed = true
    clearAnimationIntervals()
    drawGameNode(currentNode)
}

let animationLength = 2000
const animateSlower = () => {
    animationLength += 500
    document.getElementById('animation-speed').innerText = `Animation Speed: ${animationLength / 1000}s`
    clearAnimationIntervals()
}

const animateFaster = () => {
    animationLength < 1000 ? animationLength = 500 : animationLength -= 500
    document.getElementById('animation-speed').innerText = `Animation Speed: ${animationLength / 1000}s`
    clearAnimationIntervals()
}

const decreaseViewdepth = () => {
    viewDepth > 1 ? viewDepth-- : null
    document.getElementById('depth-display').innerText = `View depth: ${viewDepth}`
    baseRadius = canvas.height / (2.5 * viewDepth)
    currentNode = new recursiveGameNode(currentNode.path, xOrigin, yOrigin, 2 * Math.PI, 0, baseRadius, currentNode.path.length, currentNode.path.length + viewDepth, { x: ' ' })
    drawGameNode(currentNode)
}

const increaseViewdepth = () => {
    viewDepth < 9 ? viewDepth++ : null
    document.getElementById('depth-display').innerText = `View depth: ${viewDepth}`
    baseRadius = canvas.height / (2.5 * viewDepth)
    currentNode = new recursiveGameNode(currentNode.path, xOrigin, yOrigin, 2 * Math.PI, 0, baseRadius, currentNode.path.length, currentNode.path.length + viewDepth, { x: ' ' })
    drawGameNode(currentNode)
}

const showInfoDisplay = (bool) =>{
    let display = document.getElementById('info-container')
    if(bool){
        display.classList.remove('hidden')
    }else{
        display.classList.add('hidden')
    } 
    return
}

const testArray = []
const radOffset = testArray.length
let viewDepth = 5
let baseRadius = canvas.height / (2.5 * viewDepth)
const treeHead = new recursiveGameNode(testArray, xOrigin, yOrigin, 2 * Math.PI, 0, baseRadius, radOffset, testArray.length + viewDepth, { x: ' ' })

let currentPath = []
let pathCopy = []
let intermediateNode = []

let currentNode = treeHead

iLines = true
iNodes = true
iLinesColorized = true
iNodesColorized = true
iFV = true
iFVClosed = false

drawGameNode(treeHead)

document.getElementById('TTT-gameboard').addEventListener('click', (e) => {
    if (!e.target.classList.contains('marked') && (e.target.classList.contains('TTT-tile'))) {
        currentPath.push(Number(e.target.id))
        let result = findGameNode(treeHead, currentPath)

        if (result) {
            currentNode = makeIntermediateNode(result)
            drawGameNode(currentNode)
            e.target.classList.add('marked')
            currentPath.length % 2 === 1 ? e.target.innerText = 'X' : e.target.innerText = 'O'
            pathCopy = currentPath.slice()
        } else {
            currentPath.pop()
        }
    }
})

document.getElementById('btn-reset').addEventListener('click', () => {
    resetBoard()
})
document.getElementById('btn-undo').addEventListener('click', () => {
    undoMove(treeHead)
})
document.getElementById('btn-redo').addEventListener('click', () => {
    redoMove(treeHead)
})