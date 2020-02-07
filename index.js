const electron = require('electron');
const {ipcRenderer} = electron;
const ul = document.querySelector('ul');
const searchedItemList = document.getElementById('searchedItem')
const XIVAPI = require('xivapi-js');
const xiv = new XIVAPI();

let searchedItemData;
let selectedItem;
let selectedItemData;
const listingTable = document.getElementById("itemListingsBody");

/** Server name corresponding to the official server ID sent by the packets */
const serverName = {
    '44': 'Anima',
    '23': 'Asura',
    '24': 'Belias',
    '70': 'Chocobo',
    '47': 'Hades',
    '48': 'Ixion',
    '82': 'Mandragora',
    '96': 'Masamune',
    '28': 'Pandaemonium',
    '29': 'Shinryu',
    '61': 'Titan'
}

/** Event handler for when the back button (that appears in the item info page) */
document.getElementById("backButton").onclick = function(){
    document.getElementById("backButton").className = "hide";
    document.getElementById("searchedItem").classList.remove("hide");
    document.getElementById("itemInfo").className = "hide";
}

/** Function to filter the listings by server.
    It is technically just regenerating the table with different data.
 */
const filterItemListingBy = (server) =>{
    document.getElementById("server-column").className = "hide";
    listingTable.innerHTML = "";
    selectedItemData[0].listings[server].forEach((item, index) => {
        // console.log(item);
        let newRow = document.createElement("tr");
        let quantity_cell = document.createElement("td");
        quantity_cell.innerText = item.quantity;
        quantity_cell.setAttribute("align", "center");

        let price_cell = document.createElement("td");
        price_cell.innerText = item.pricePerUnit
        price_cell.setAttribute("align", "center");

        let total_cell = document.createElement("td");
        total_cell.innerText = item.total;
        total_cell.setAttribute("align", "center");

        let hq_cell = document.createElement("td");
        hq_cell.innerText = item.hq == 0 ? "" : "✅"
        hq_cell.setAttribute("align", "center");

        newRow.appendChild(quantity_cell);
        newRow.appendChild(price_cell);
        newRow.appendChild(total_cell);
        newRow.appendChild(hq_cell);
        listingTable.appendChild(newRow);
    })
}

/** Event handlers for all the server's filter */
document.getElementById("asura-filter").onclick = function(){
    filterItemListingBy("23");
}

document.getElementById("anima-filter").onclick = function(){
    filterItemListingBy("44");
}

document.getElementById("belias-filter").onclick = function(){
    filterItemListingBy("24");
}

document.getElementById("chocobo-filter").onclick = function(){
    filterItemListingBy("70");
}

document.getElementById("hades-filter").onclick = function(){
    filterItemListingBy("47");
}

document.getElementById("ixion-filter").onclick = function(){
    filterItemListingBy("48");
}

document.getElementById("mandragora-filter").onclick = function(){
    filterItemListingBy("82");
}

document.getElementById("masamune-filter").onclick = function(){
    filterItemListingBy("96");
}

document.getElementById("pandaemonium-filter").onclick = function(){
    filterItemListingBy("28");
}

document.getElementById("shinryu-filter").onclick = function(){
    filterItemListingBy("29");
}

document.getElementById("titan-filter").onclick = function(){
    filterItemListingBy("61");
}

document.getElementById("view-all").onclick = function(){
    updateListingTable();
}

/** Calls the xivapi to update the item's name */
const updateItemName = async () => {
    
    for (let i = 0; i < searchedItemData.length; i++){
        let ret = await xiv.data.get('item', searchedItemData[i].itemID).then(token => { return token.Name});
        searchedItemData[i].itemName = ret
    }
    generateSearchedItemList(searchedItemData, 'func')
}

const updateListingTable = () => {

    listingTable.innerHTML = "";
    document.getElementById("server-column").classList.remove("hide");
    document.getElementById("itemName").innerText = selectedItemData[0].itemName;
    Object.keys(selectedItemData[0].listings).forEach((key, index) => {
        selectedItemData[0].listings[key].forEach((item, index) => {
            // console.log(item);
            let newRow = document.createElement("tr");

            let server_cell = document.createElement("td");
            server_cell.innerText = serverName[key];
            server_cell.setAttribute("align", "center");

            let quantity_cell = document.createElement("td");
            quantity_cell.innerText = item.quantity;
            quantity_cell.setAttribute("align", "center");

            let price_cell = document.createElement("td");
            price_cell.innerText = item.pricePerUnit
            price_cell.setAttribute("align", "center");

            let total_cell = document.createElement("td");
            total_cell.innerText = item.total;
            total_cell.setAttribute("align", "center");

            let hq_cell = document.createElement("td");
            hq_cell.innerText = item.hq == 0 ? "" : "✅"
            hq_cell.setAttribute("align", "center");

            newRow.appendChild(server_cell);
            newRow.appendChild(quantity_cell);
            newRow.appendChild(price_cell);
            newRow.appendChild(total_cell);
            newRow.appendChild(hq_cell);
            listingTable.appendChild(newRow);
        })
    })
    
}

/**
    Generated the list of items whose listings have been viewed on the marketboard.
    It is being refreshed everytime a listing is viewed and also when the name of the item
    has been updated. On first generation, the name is not showed as the item name
    has not been updated but the xivapi.
 */
const generateSearchedItemList = (arg, src) => {
    // console.log("item:search called")
    searchedItemData = arg;

    searchedItemList.innerHTML = "";

    for(var i = 0; i<arg.length; i++){
        const div = document.createElement('div');
        const itemNameButton = document.createElement('button');
        itemNameButton.setAttribute("itemid", arg[i].itemID)
        itemNameButton.onclick = function(){
            // console.log("CLICKEDDD")
            document.getElementById("searchedItem").className = "hide";
            document.getElementById("backButton").classList.remove("hide");
            selectedItem = itemNameButton.getAttribute('itemid');
            selectedItemData = searchedItemData.filter(i => i.itemID == selectedItem)
            document.getElementById("itemInfo").classList.remove("hide")
            updateListingTable();
            return false;
        }

        const itemName = document.createElement('h3');
        let itemName_text =  arg[i].itemName;
        const itemNameText = document.createTextNode(itemName_text);

        itemName.appendChild(itemNameText);
        itemNameButton.appendChild(itemName);
        div.appendChild(itemNameButton);

        const server_visited_table = document.createElement('table');
        server_visited_table.setAttribute('width', '100%')
        server_visited_table.setAttribute('height', '50px')
        const svt_row = document.createElement('tr');
        // console.log(arg[i])
        Object.keys(arg[i].listings).forEach((key, index) => {
            let svt_name = document.createTextNode(serverName[key])
            if (arg[i].listings[key].length > 0){
                const svt_cell = document.createElement('td');
                svt_cell.setAttribute('bgcolor', '#00FF00')
                svt_cell.appendChild(svt_name)
                svt_row.appendChild(svt_cell)
            }else{
                const svt_cell = document.createElement('td');
                svt_cell.setAttribute('bgcolor', '#FF0000')
                svt_cell.appendChild(svt_name)
                svt_row.appendChild(svt_cell)
            }
        })
        server_visited_table.appendChild(svt_row);
        div.appendChild(server_visited_table)
        searchedItemList.appendChild(div);
    }

    if(src == "ipc"){
        updateItemName();
    }
}

ipcRenderer.on('item:search', async (_evt, arg) => {
    searchedItemData = arg
    generateSearchedItemList(arg, "ipc");

})

ipcRenderer.on('player:spawn', function(evt, currentWorldID){
    const cw = document.getElementById('currentWorld');
    let currentWorld = serverName[currentWorldID]
    cw.innerHTML = currentWorld
})

//sort item listing table
const itemListingTable = document.querySelector("table");

itemListingTable.querySelectorAll("th").forEach((elem, columnNo) => {
    elem.addEventListener("click", event => {
        console.log("sort! " + columnNo)
        sortTable(itemListingTable, columnNo);
    })
})

const sortTable = (table, sortColumn) => {
    const tableBody = itemListingTable.querySelector('tbody');
    const tableData = tableToData(tableBody);

    tableData.sort((a,b) => {
        // WIP: Don't parseInt when sort by server
        if (parseInt(a[sortColumn]) > parseInt(b[sortColumn])){
            return 1;        
        }
        return -1;
    })

    dataToTable(tableBody, tableData);
}

const tableToData = (tableBody) => {
    const tableData = [];
    tableBody.querySelectorAll('tr').forEach(row => {
        const rowData = [];
        row.querySelectorAll('td').forEach(cell => {
            rowData.push(cell.innerText);
        })
        tableData.push(rowData)
    })
    return tableData;
}

const dataToTable = (tableBody, tableData) => {
    tableBody.querySelectorAll('tr').forEach((row, i) => {
        const rowData = tableData[i];
        row.querySelectorAll('td').forEach((cell, j) => {
            cell.innerText = rowData[j]
        })
        tableData.push(rowData);
    })
}