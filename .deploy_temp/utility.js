$(document).ready(function() {
	// Dont move these lines - they must come first
	/****************************** START ************************************/
	// Add Accessibility Hide Button to widget
	$('#OA_Header').append(`<div class="accessibility-hide-button">הסתר</div>`);
	/***************************** FINISH *************************************/

	// Handling Hiding Button For Accessibility
	handleAccessibilityHideButton();

	function handleAccessibilityHideButton() {
		let qaIcon = $('#OA_Icon');
		let disableAccessibilityButton = $('.accessibility-hide-button');
		let accessibilityCloseButton = $('#OA_Widget_Close');
		$('#OA_Widget_Label').css({width: '60%'});

		qaIcon.click(() => setTimeout(() => disableAccessibilityButton.fadeIn(), 400));
		accessibilityCloseButton.click(() => disableAccessibilityButton.hide());

		disableAccessibilityButton.click(() => {
			$('#OA_Container').remove(); // Remove Widget
			disableAccessibilityButton.hide(); // Hide button
		});
	}

	// Handling Hiding Button For Chat

	 let addedCloseButton = false;
	 let isChatHidden = false;

	 $(document.body).on('click', '#glassix-widget-launcher-container', function(e) {
	 	addRemoveChatButton();
	 	activateRemoveChatButton();
	 	removeButtonOnNextApperance();
	 });

	function addRemoveChatButton() {
	 	$('#glassix-widget-iframe-wrapper').prepend("<div class='chat-close-button'>הסתר</div>");
	 }
	 function activateRemoveChatButton() {
	 	$('.chat-close-button').click(function() {
	 		isChatHidden = true;
	 		$('#glassix-container').remove();
	 		$('#glassix-widget-launcher-container').css({display: 'none'});
	 		$('.chat-hide-button').css({display: 'none'});
	 	});
	 }

	 function removeButtonOnNextApperance() {
	 	$(document.body).on('DOMNodeInserted', '#glassix-widget-launcher-container', function(e) {
	 		if (e && e.target && isChatHidden) {
 			e.target.remove();
	 		}
	 	});
	 }
});
