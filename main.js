const electron = require('electron');
const url = require('url');
const path = require('path');
const MachinaFFXIV = require('node-machina-ffxiv');
const Machina = new MachinaFFXIV();
let currentWorldID = "23";

const {app, BrowserWindow} = electron;

let win;
let searchedData = [];

//create app window
function createWindow() {

    win = new BrowserWindow({
        width:1000,
        height: 900,
        minWidth: 1000,
        minHeight: 900,
        webPreferences:{
            nodeIntegration: true
        },
        show: false,
        center: true
    })
    win.loadFile('index.html');

    win.once('ready-to-show', ()=>{
        win.show()
    })
}

// start app
app.on('ready', createWindow)

//start Machina
Machina.start(() => {
    console.log("Machina started!");
})

//filter machina to only accept packets with these types
Machina.filter(['marketBoardItemListing', 'playerSpawn'])

//listener for when user view a market board item listing
Machina.on('marketBoardItemListing', (content) => {


    //Check if item already exists in the searchedData array
    const exists = searchedData.some(i => i.itemID == content.itemID)

    //TODO: Check if item already been searched before making new object for item
    if(!exists){
        // console.log("item no exists")
        // getItemName(parseInt(content.itemID))
        let item = {
            itemID: content.itemID,
            itemName: 'Loading..',
            listings: {
                '44': [],
                '23': [],
                '24': [],
                '70': [],
                '47': [],
                '48': [],
                '82': [],
                '96': [],
                '28': [],
                '29': [],
                '61': []
            }
        }

        for( var i = 0;  i < content.listings.length; i++){
            item.listings[currentWorldID].push({
                listingID: content.listings[i].listingID,
                retainerName: content.listings[i].retainerName,
                pricePerUnit: content.listings[i].pricePerUnit,
                total: content.listings[i].total,
                quantity: content.listings[i].quantity,
                totalTax: content.listings[i].totalTax,
                hq: content.listings[i].hq
            })
        }
        searchedData.push(item)
    }else{
        // console.log("item exists")
        searchedData = searchedData.map((item) => {
            if(item.itemID === content.itemID){
                
                for(var i = 0;  i < content.listings.length; i++){
                    const i_exists = item.listings[currentWorldID].some(x => x.listingID == content.listings[i].listingID)
                    // console.log("listing exists")
                    if (!i_exists){
                        item.listings[currentWorldID].push({
                            listingID: content.listings[i].listingID,
                            retainerName: content.listings[i].retainerName,
                            pricePerUnit: content.listings[i].pricePerUnit,
                            total: content.listings[i].total,
                            quantity: content.listings[i].quantity,
                            hq: content.listings[i].hq
                        })
                    }
                    
                }
            }
            return item
        })
        
    }
    
    // console.log(searchedData);
    win.webContents.send('item:search', searchedData)
});

// Used to get the current server the player is at when checking market board prices
// Unfortunately it triggers on every player spawn
Machina.on('playerSpawn', (packet) => {
    currentWorldID = packet.currentWorldId;
    win.webContents.send('player:spawn', currentWorldID);
    // console.log(currentWorldID);
});

// For testing
// Machina.on('any', (packet) => {
//     console.log(packet.type)
//   });