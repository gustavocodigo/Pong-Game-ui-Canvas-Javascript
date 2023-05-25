let canvas;

let WIDTH;
let HEIGHT;

let keys = {
    ["up"]: false,
    ["down"]: false,
    ["enter"]: false,
    ["space"]: false
}

let objectList = []
let player1, player2, ball, currentMenu, mainMenu;
let deltaTime = 0

const game_states = {
    MAIN_MENU: 3,
    PLAYING: 0,
    GAME_OVER:1
}


function drawRect(x,y,w,h,color){
    canvas.fillStyle = color
    canvas.fillRect(x,y,w,h)
}

let game_state = game_states.MAIN_MENU

window.addEventListener("keydown", function (event) {
    if (event.defaultPrevented) {
      return;
    }
    switch (event.key) {
      case "ArrowDown":
        keys["down"] = true;
        break;
      case "ArrowUp":
        keys["up"] = true;
        break;
      case "Enter":
       keys["enter"] = true
        break;
    case " ":
        keys["space"] = true
        break;
      default:
        return;
    }
    event.preventDefault();
  }, true);



window.addEventListener("keyup", function (event) {
    if (event.defaultPrevented) {
      return;
    }
    switch (event.key) {
      case "ArrowDown":
        keys["down"] = false;
        break;
      case "ArrowUp":
        keys["up"] = false;
        break;
        case "Enter":
       keys["enter"] = false
        break;
        case " ":
            keys["space"] = false
            break;
      default:
        return;
    }
  
    event.preventDefault();
  }, true);

 
  

class Ball {
    constructor() {
        this.x = 0
        this.y = 0
        this.vx = 2
        this.vy = 5
        this.size = 15
        this.reset()
    }

    reset() {
         this.x = WIDTH/2
        this.y = HEIGHT/2
        this.vx = 4
        this.vy = 4
    }

    checkForCollision(){
        for(let i = 0; i < objectList.length; i++) {
            let current =    objectList[i]
            if ( current.objectId == "player" ) {
                if ( this.x > current.x-current.len/2 && this.x < current.x+current.len/2 ) {
                    if (this.y > current.y-current.size/2 && this.y < current.y+current.size/2) {
                        this.vx = -this.vx
                    } 
                }
            }
        }
    }



    update(){
        
        if ( this.x < 0 || this.x > WIDTH){
            this.vx = -this.vx
           
            if (this.x > WIDTH) {
                player1.points ++;
                this.x = WIDTH
            }else{
                player2.points ++;
                this.x = 0
            }
            updateGui()
            game_state = game_states.MAIN_MENU
            let ball = this
            currentMenu = new MainMenu(["Resumir","Menu principal"], function(option){
                if (option == 0 ){
                    game_state = game_states.PLAYING
                    ball.reset()
                }
                if (option == 1) {
                    currentMenu = mainMenu
                }
            })
        }

        if ( this.y < 0 || this.y > HEIGHT){
            this.vy = -this.vy
            
        }


        this.x = this.x + this.vx
        this.y = this.y + this.vy

        
        this.checkForCollision()
    }

    draw(){
        drawRect(this.x-this.size/2, this.y-this.size/2, this.size, this.size, "#FFF");
    }


}

class Player{
    constructor(){
        this.x = 0
        this.y = 0
        this.size = 80;
        this.objectId = "player"
        this.len = 10
        this.points = 0
    }

    update(){
        if ( ( this.y-this.size/ 2 ) < 0 ) {
            this.y = this.size / 2
        }
        if ( ( this.y+this.size/2 ) > HEIGHT ) {
            this.y = HEIGHT - this.size / 2
        }
    }

    draw(){
        drawRect(this.x-this.len/2, this.y-this.size/2, this.len, this.size, "#FF0000" );
    }
}



class PlayerMain extends Player {
    constructor(){
        super()
        this.dir = 1
        this.speed = 5;
        this.temspeed = this.speed
    }

    update(){
        this.tempspeed = this.speed;
        if (keys["up"] ){
            this.dir = -1
        }else if (keys["down"] ){
            this.dir = 1
        }else{
            this.tempspeed = 0;
        }
        
        this.y += this.dir * this.tempspeed
       super.update()
    }
}


class Bot extends Player {
    constructor(ball){
        super()
        this.dir = 1
        this.speed = 4;
        this.temspeed = this.speed;
        this.ball = ball
    }


    calc_movements(){
        let distY = Math.abs(this.y - this.ball.y)
        
        if( ((distY < 10) || (this.ball.x < WIDTH/2)) || (this.ball.vx < 0) ) {
            this.dir = 0
            return
        }
        if ( this.ball.y > this.y ){
            this.dir = 1
        }

        if ( this.ball.y < this.y ){
            this.dir = -1
        }
    }
    update(){
        this.calc_movements()
        this.tempspeed = this.speed;
        this.y += this.dir * this.tempspeed
        super.update()
    }
}



class Inventario {
    constructor( player) {
        this.player = player
        this.inverts = 2
        this.nextInvert = 0
    }
    update() {
       
        if (keys["space"]) {
            if (this.inverts > 0) {
                ball.vx = -ball.vx
                keys["space"] = false
                this.inverts --;
            }
           
        }
        this.nextInvert += 1/(60*120)
        if (this.nextInvert >= 1 ) {
            this.inverts += 1
            this.nextInvert = 0
        }
    }

    draw() {
        drawRect(4,4, 150, 80, "#FFFFFF44")
        canvas.fillStyle = "white";
        canvas.font = "16px serif";
        canvas.textAlign = 'left';
        canvas.fillText("INVERTS: "+this.inverts, 10, 5+20);
        canvas.font = "10px serif";
        canvas.fillText("SPACE", 8, 5+40);
        drawRect(5,70, 145 , 10, "#5555599")
        drawRect(5,70, 145 * this.nextInvert, 10, "#00FFFF99")

    }
}

// ui

class MainMenu {
    constructor(op, selectedOptionCallback, title){
        this.options = op
        this.currentSelectedOption = 0
        this.selectedOptionCallback = selectedOptionCallback
        this.title = title
    }
    update() {
        if ( keys["down"] ){
            keys["down"] = false
            this.currentSelectedOption = this.currentSelectedOption +1
        }
          if ( keys["up"] ){
            keys["up"] = false
            this.currentSelectedOption = this.currentSelectedOption -1
        }
        if (this.currentSelectedOption > (this.options.length-1) ) {
            this.currentSelectedOption = 0
        }
        if ( this.currentSelectedOption < 0 ) {
            this.currentSelectedOption = this.options.length -1
        }

        if (keys["enter"]) {
            keys["enter"] = false
           this.selectedOptionCallback(this.currentSelectedOption)
        }
    }
    draw(){  
        let calcheight = (this.options.length) * 22;
        let calcwidth = 0
        let biggerTextLen = 0
        let offsetY = 0
        if ( this.title ){
            calcheight += 20
            offsetY = 20
            biggerTextLen = this.title.length /2
        }
        for(let i = 0; i <this.options.length; i++){
            if (biggerTextLen < this.options[i].length){
                biggerTextLen = this.options[i].length
            }
        }
        calcwidth = biggerTextLen * 14
       
        drawRect(WIDTH/2-(calcwidth/2+10)+10, HEIGHT/2-40, calcwidth+20, calcheight+70, "#00000099")
        drawRect(WIDTH/2-(calcwidth/2+10), HEIGHT/2-50, calcwidth+20, calcheight+70, "white")
        if ( this.title ){
            
            canvas.fillStyle = "black";
            canvas.font = "11px serif";
            canvas.textAlign = 'left';
          
            canvas.fillText(this.title, WIDTH/2 - calcwidth/2, HEIGHT/2 - 20 );

        }
        for(let i = 0; i <this.options.length; i++){
            canvas.font = "18px serif";
            canvas.textAlign = 'center';
            let str = this.options[i]
            if (this.currentSelectedOption == i) {
               canvas.fillStyle = "red";
               canvas.font = "22px serif";
            }else{
                canvas.fillStyle = "black";
            }
            canvas.fillText(str, WIDTH/2 , HEIGHT/2 + offsetY + (i * (25+6)));
        }
    }
}

function updateGui() {
    let ppoints = document.getElementById("playerPoints")
    let ppoints2 = document.getElementById("maquinaPoints")
    ppoints.innerText = player1.points
    ppoints2.innerText = player2.points
}

function restart_playing()
{
    objectList = []
    ball = new Ball()
    player1 = new PlayerMain()

    player1.x = 15
    player1.y = HEIGHT /2
    objectList.push(player1)

    player2 = new Bot(ball)
    player2.x = WIDTH - 15
    player2.y = HEIGHT / 2
    objectList.push(player2)

    objectList.push(ball)

    let inventario = new Inventario(player1)
    objectList.push(inventario)
}


function init()
{
    let canvasElement = document.getElementById("canvasGame")
    canvas = canvasElement.getContext("2d")
    WIDTH = canvasElement.width
    HEIGHT = canvasElement.height

    restart_playing()
    requestAnimationFrame(render)


    let credit ="JGUSTAVO INICIANTE"

    

    let  creditsMenu, projectInfo;


    mainMenu = new MainMenu([
        "COMEÇAR O JOGO",
        "CREDITOS",
        "PROJETO"
    ], function(option){

        if (option == 0){
            game_state = game_states.PLAYING
            restart_playing()
        }
        if (option == 1){
            currentMenu = creditsMenu
        }
        if (option == 2){
            currentMenu = projectInfo           
        }
    },"PONG GAME POR GUSTAVO X")


    creditsMenu = new MainMenu([
        credit,
        "YOUTUBE",
        "GITHUB",
        "VOLTAR"
    ], function(option){
        switch(option) {
            case 1:
                window.open("https://www.youtube.com/");
                break;
            case 2:
                window.open("https://github.com/gustavocodigo");
                break;
            case 3:
                currentMenu = mainMenu
            break;
        }
       
    })

    projectInfo = new MainMenu([
        "OK"
    ], function(option){
        currentMenu = mainMenu
    },"Versao 0.2 esse é um jogo demo")

    currentMenu = mainMenu
}






function update()
{
    if (game_state == game_states.MAIN_MENU)
    {
        currentMenu.update()
    }
    else if(game_state == game_states.PLAYING) {
        for(let i = 0; i < objectList.length; i++) {
            objectList[i].update()
        }
    }
}

function render()
{
    deltaTime = 1 / 60
    update()
    drawRect(0,0,WIDTH,HEIGHT, "black")
    canvas.strokeStyle = "#FFFFFF";
    canvas.strokeRect(0,0, WIDTH, HEIGHT)


  
    for(let i = 0; i < objectList.length; i++) {
         objectList[i].draw()
    }
    if (game_state == game_states.MAIN_MENU)
    {
        currentMenu.draw()
    }
  
    requestAnimationFrame(render)
}