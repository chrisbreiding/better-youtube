(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(['backbone', 'localstorage', 'services/vent', 'subscriptions/subscription-model'], function(Backbone, Store, vent, SubscriptionModel) {
    var SubscriptionsCollection;
    SubscriptionsCollection = (function(_super) {

      __extends(SubscriptionsCollection, _super);

      function SubscriptionsCollection() {
        return SubscriptionsCollection.__super__.constructor.apply(this, arguments);
      }

      SubscriptionsCollection.prototype.model = SubscriptionModel;

      SubscriptionsCollection.prototype.localStorage = new Store('subscriptions');

      SubscriptionsCollection.prototype.initialize = function() {
        var _this = this;
        return vent.on('subscription:add', function(modelAttrs) {
          return _this.create(modelAttrs);
        });
      };

      return SubscriptionsCollection;

    })(Backbone.Collection);
    return new SubscriptionsCollection;
  });

}).call(this);
