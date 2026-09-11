export function runSeatMapScripts(htmlMap, eventimStore, createReservationFunction, identityNumber) {
  
	const getScripts = htmlMap.match(/<script>(.*?)<\/script >/g, htmlMap);
	const code =
		getScripts[0].replace(/<script>/, '').replace(/<\/script >/, '');
	try {
		(window as any).eval(code);
		// (window as any).eval(`document.getElementsByClassName('seatMap')[0].className = "seatMap seatMapRightDirection";`);

		// (window as any).eval(getScripts[0].replace(/<script>/, '').replace(/<\/script >/, ''));
	} catch (error) {}
	let listOfTicketsByKey = eventimStore.tickets.map((t) => {
		return {[`${t.priceLevelId}_${t.ticketTypeId}`]: t};
	});
	(window as any).createReservation = createReservationFunction;
  
	// Scripts tal sent from email
	const functions = `
    function getAllSelectedSeatsFromMap(listOfSeats) {
      var seats = [];
      console.log(listOfSeats)
      for (var i = 0; i < listOfSeats.length; i++) {
        
        var seat = listOfSeats[i];
        var key = seat.priceLevelId + "_" + seat.ticketType.TicketTypeID + "_" + i;
        var ticketsKeys = JSON.parse('${JSON.stringify(listOfTicketsByKey)}');
        var dict = new Object();

        for(var j=0;j<ticketsKeys.length;j++) {
          dict[Object.keys(ticketsKeys[j])[0]  + "_" + i]=Object.values(ticketsKeys[j])[0];
        }
        var seatObj = {
          VariantFullBarcode: dict[key].variantFullBarcode,
          PriceID: seat.ticketType.PriceID,
          SeatID: seat.seatId,
          Row: seat.row,
          Seat: seat.seat,
          TicketTypeName: seat.ticketType.Text,
          // Area: seat.seatmapData.seat._data.areaId,
          PriceLevelId: seat.priceLevelId,
          TicketTypeId: seat.ticketType.TicketTypeID,
          priceLevelName: dict[key].priceLevelName,
          ticketTypeName: seat.ticketType.Text,
          Coins: 0,
          price: dict[key].price,
          Area: seat.area,
          quantity: 1
        }

    
        seats.push(seatObj);


      }

      var dataToCreate = JSON.stringify({
        EventId: ${eventimStore && eventimStore.selectedEvent ? eventimStore.selectedEvent.eventId : ''},
        MemberId: ${identityNumber},
        JourneyId: 1,
        ListOfSeats: seats
      })
      console.log(dataToCreate)
      window.createReservation(dataToCreate);
    }

    function listenToShoppingCart() {
      var shopingCart = document.getElementById("seatmapShoppingCartBtn");
      console.log('shopingCart => '+shopingCart)
      if (shopingCart) {
        shopingCart.addEventListener("click", function (e) {
          var data = getAllSelectedSeats();
          console.log(data)
          getAllSelectedSeatsFromMap(data);
        });
      }
    }
    setTimeout(listenToShoppingCart, 1000);
    `;
	try {
		(window as any).eval(functions);
	} catch (error) {
		console.log('runSeatMapScripts Error phase 2', error);
	}
}
