$(function() {
    // Navigate to the selected game screen when a game option is clicked
    $('.game-option').on('click', function() {
        var selectedGame = $(this).data('game');

        // Hide the game selection screen, show the selected game
        $('#game-selection').hide();
        $('#' + selectedGame).show();
    });

    // Return to the game selection screen when the "Go Back" button is clicked
    $('[data-back]').on('click', function() {
        // Hide the current game screen
        $(this).closest('div').hide();
        // Show the game selection screen again
        $('#game-selection').show();
    });
});