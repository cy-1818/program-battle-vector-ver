var screen=document.getElementById("canvas");
var c = screen.getContext('2d');
var redHP=document.getElementById("redHP");
var blueHP=document.getElementById("blueHP");
var redprogram=document.getElementById("redprogram");
var blueprogram=document.getElementById("blueprogram");
var jsid = 0;
var th = {},newspeed = 0,impulse = 0,HPE,HPT,shotTime=0;
var ec = 0.5;

var addDrow={
 added:false,
 elements:[],
 add:function(func,obj){
  this.elements.push([func,obj]);
  this.added=true;
 },
 drow:function(){
  if(this.added){
   for(var n in this.elements){
    this.elements[n][0](this.elements[n][1]);
   }
   this.added=false;
   this.elements=[];
  }
 }
}

function isThere(name,x,y){
  switch(name.shape){
    case "circle":
      if((name.x-x)**2+(name.y-y)**2<name.size**2){
        return true;
      }else{
        return false;
      }
      break;
    default:
      console.error(name.shape+"was undefined as shape kind(in isThere, name:"+name.name+")");
      return false;
  }
}

function getObjectByName(name){
 if(objectPass[name]===undefined){
  console.error(name+" was undefined");
 }
 return objectPass[name];
}

function whatThere(x,y,self){
  if(self){
    var ans=self;
  }else{
    var ans=null;
  }
  for(var n in objects){
    if(objects[objects.length-n-1]!==self && isThere(getObjectByName(objects[objects.length-n-1]),x,y)){
      ans=objects[objects.length-n-1];
      break;
    }
  }
  return ans;
}

function die(name){
  objects.splice(objects.indexOf(name), 1);
  delete getObjectByName(name);
}

function outCheck(obj){
  if(obj.x>1000){
    return true;
  }else if(obj.y>500){
    return true;
  }else if(obj.x<0){
    return true;
  }else if(obj.y<0){
    return true;
  }else{
    return false;
  }
}

function makeObject(pass,name,date){
  if(objects.includes(name)){
    var forkName=name+"2",n=2;
    do{
      forkName=name+n;
      n++;
    }while(objects.includes(forkName));
    pass[forkName]=date;
    pass[forkName].name=forkName;
    objectPass[forkName]=pass[forkName];
    objects.push(forkName);
    firstRun.push(forkName);
  }else{
    pass[name]=date;
    pass[name].name=name;
    objectPass[name]=pass[name]
    objects.push(name);
    firstRun.push(name);
  }
}

function speed(obj){
  return (obj.move[0]**2+obj.move[1]**2)**0.5;
}

function power(obj){
  return 0.5*obj.mass*speed(obj)**2;
}

//------------------↓funcs↓--------------------

function func(){
  if(th.hp <= 0){
    die(th.name);
  }else{
    th.Program();
  }
  if(outCheck(th)){
    th.hp-=th.mpGain*100+10000;
  }
  th.programFirst = false;
  var target = whatThere(th.x,th.y,th.name);
  if(target !== th.name && !th.clashed.includes(target)){
    target = getObjectByName(target);
    target.clashed.push(th.name);
    th.joule = power(th);
    target.joule = power(target);
    newspeed = -1*ec*(th.move[0]-target.move[0]);
    impulse = th.mass*th.move[0]+target.mass*target.move[0];
    th.move[0]=(impulse-target.mass*newspeed)/(th.mass+target.mass);
    target.move[0]=(impulse-th.mass*newspeed)/(target.mass+th.mass);
    newspeed = -1*ec*(th.move[1]-target.move[1]);
    impulse = th.mass*th.move[1]+target.mass*target.move[1];
    th.move[1]=(impulse-target.mass*newspeed)/(th.mass+target.mass);
    target.move[1]=(impulse-th.mass*newspeed)/(target.mass+th.mass);
    th.hp -= Math.abs(target.joule-power(target));
    target.hp -= Math.abs(th.joule-power(th));
  }
  th.x+=th.move[0];
  th.y+=th.move[1];
}

function scan(face,length){
 if(th.mp>length-100&&length>=0){
  addDrow.add((function(obj){
   c.strokeStyle=obj.color;
   c.beginPath();
   c.moveTo(obj.x,obj.y);
   c.lineTo(obj.x+Math.cos(face*(Math.PI/180))*length,obj.y+Math.sin(face*(Math.PI/180))*length);
   c.closePath();
   c.stroke();
  }),th);
  th.mp-=length-100;
  var scanX=th.x+Math.cos(face*(Math.PI/180))*(length+10);
  var scanY=th.y+Math.sin(face*(Math.PI/180))*(length+10);
  var thing,scanThing,ans=[];
  for(var thing in objects){
   scanThing=getObjectByName(objects[thing]);
   if((scanThing.x-scanX)*(th.x-scanThing.x)>=0){
    if((scanThing.y-scanY)*(th.y-scanThing.y)>=0){
     if(Math.abs(scanThing.y-(scanThing.x-th.x)
      *Math.tan(face*(Math.PI/180))-th.y)<scanThing.size){
      ans.push([scanThing.name,scanThing.x,scanThing.y]);
     }else if(Math.abs(scanThing.x-(scanThing.y-th.y)
      /Math.tan(face*(Math.PI/180))-th.x)<scanThing.size){
      ans.push([scanThing.name,scanThing.x,scanThing.y]);
     }
    }
   }
  }
  //console.log(ans);
  return ans;
 }else{
  return [];
 }
}

function move(face,acceleration){
  if(acceleration>1000){
    move(face,1000);
  }else{
    if(acceleration>=0&&moveLogi&&(th.hp>acceleration*th.mass/10||speed(th)<10)){
      moveLogi=false;
      if(speed(th)>=10){
        th.hp-=acceleration*th.mass/10;
      }
      th.move[0]+=Math.cos(face*(Math.PI/180))*acceleration/40;
      th.move[1]+=Math.sin(face*(Math.PI/180))*acceleration/40;
    }
  }
}

function shot(face,v0){
  if(th.mp >= v0 && shotTime<10){
    if(v0 > th.mpGain*100){
      shot(face,th.mpGain*100);
    }else{
      th.mp-=v0;
      shotTime++;
      makeObject(otherObjects,th.parent+"shot:shot",{
        Program:(function(){return 0;}),
        Func:func,
        programFirst:true,
        name:th.parent+"shot:shot",
        x:th.x+Math.cos(face*(Math.PI/180))*(th.size+7),
        y:th.y+Math.sin(face*(Math.PI/180))*(th.size+7),
        move:[Math.cos(face*(Math.PI/180))*v0/200,
              Math.sin(face*(Math.PI/180))*v0/200],
        hp:10,
        mp:0,
        mpGain:1,
        mass:3,
        shape:"circle",
        size:3,
        color:"white",
        border:th.color,
        sub:{},
        parent:th.parent,
        clashed:[],
        joule:0
      });
    }
  }
}

function heal(addHP){
  if(th.mp>addHP*th.hp/50&&addHP>=0){
    th.mp-=addHP*th.hp/50;
    th.hp+=addHP;
  }
}

function mpGainUp(){
  if(th.mp>th.mpGain**2/100){
    th.mp-=th.mpGain**2/100;
    th.mpGain*=10;
  }
}

function getX(){
  return th.x;
}

function getY(){
  return th.y;
}

function getHP(){
  return th.hp;
}

function getMP(){
  return th.mp;
}

function getMpGain(){
  return th.mpGain;
}

function first(){
  return th.programFirst;
}

//------------------↑funcs↑--------------------

function run(){
  for(var n in objects){
    moveLogi=true;
    shotTime=0;
    th = getObjectByName(objects[n]);
    th.Func();
    th.clashed=[];
  }
}

function giveMP(){
  var pass;
  for(var n in objects){
    pass=getObjectByName(objects[n]);
    pass.mp+=pass.mpGain;
  }
}

function draw(){
 var thing;
 c.clearRect(0,0,1000, 500);
 for(var n in objects){
  thing=getObjectByName(objects[n]);
  switch(thing.shape){
   case "circle":
   default:
    c.strokeStyle =thing.border;
    c.fillStyle =thing.color;
    c.beginPath();
    c.arc(thing.x, thing.y, thing.size, 0, 2 * Math.PI);
    c.closePath();
    c.fill();
    c.stroke();
  }
 }
 addDrow.drow();
}

function hpShow(){
 redHP.innerHTML="";
 blueHP.innerHTML="";
 for(var i in objects){
  if(objects[i].split(":")[0]=="red"){
   thing=getObjectByName(objects[i]);
   HPE=document.createElement('span');
   if(objects[i]=="red"){
    HPE.appendChild(document.createTextNode("red:"));
   }else{
    HPE.appendChild(document.createTextNode(objects[i].split(":")[1]+":"));
   }
   HPE.style.color=thing.color;
   HPE.appendChild(document.createTextNode(thing.hp));
   redHP.appendChild(HPE);
   redHP.appendChild(document.createElement('br'));
  }else if(objects[i].split(":")[0]=="blue"){
   thing=getObjectByName(objects[i]);
   HPE=document.createElement('span');
   if(objects[i]=="blue"){
    HPE.appendChild(document.createTextNode("blue:"));
   }else{
    HPE.appendChild(document.createTextNode(objects[i].split(":")[1]+":"));
   }
   HPE.style.color=thing.color;
   HPE.appendChild(document.createTextNode(thing.hp));
   blueHP.appendChild(HPE);
   blueHP.appendChild(document.createElement('br'));
  }
 }
}

function js(){
  run();
  draw();
  giveMP();
  hpShow();
}

function start(){
  clearInterval(jsid);
  objects=["red","blue"];
  otherObjects={};
  firstRun=["red","blue"];
  red={
    Program:new Function(redprogram.value),
    Func:func,
    programFirst:true,
    name:"red",
    x:100,
    y:250,
    move:[0,0],
    hp:1000,
    mp:1000,
    mpGain:1,
    mass:10,
    shape:"circle",
    size:10,
    color:"red",
    border:"red",
    sub:{},
    parent:"red",
    clashed:[],
    joule:0
  }
  blue={
    Program:new Function(blueprogram.value),
    Func:func,
    programFirst:true,
    name:"blue",
    x:900,
    y:250,
    move:[0,0],
    hp:1000,
    mp:1000,
    mpGain:1,
    mass:10,
    shape:"circle",
    size:10,
    color:"blue",
    border:"blue",
    sub:{},
    parent:"blue",
    clashed:[],
    joule:0
  }
  objectPass={"red":red,"blue":blue};
  jsid=setInterval(js,40);
}
