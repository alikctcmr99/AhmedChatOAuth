angular.module('app').directive('messageItem', function(MessageService) {
  return {
    restrict: "E",
    templateUrl: 'components/message-item/message-item.html',
    scope: {
      senderUuid: "@",
      senderLogin: "@",
      content: "@",
      date: "@"
    }
  };
});