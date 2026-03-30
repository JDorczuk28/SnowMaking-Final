async function getHistory(){
    console.log("hello")
    const panel = document.getElementById("history-Panel")
    const historyList = document.getElementById("History-List")
    const isOpen = panel.style.display === "block"
    if(isOpen){
        panel.style.display = "none"
        return
    }

    const res = await fetch("/history")
    const data = await res.json()

    historyList.innerHTML = data.history.map(h => `<p>${h.valve_name.toUpperCase()} - ${h.type.toUpperCase()} - ${h.state} - ${h.time} - by: ${h.user}</p>`).join("")
    panel.style.display = "block"
    console.log(historyList)

}
