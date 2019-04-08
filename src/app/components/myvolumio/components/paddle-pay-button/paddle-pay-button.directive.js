class PaddlePayButtonDirective {
  constructor() {
    'ngInject';
    let directive = {
      restrict: 'E',
      templateUrl: 'app/components/myvolumio/components/paddle-pay-button/paddle-pay-button.html',
      controller: PaddlePayButtonController,
      controllerAs: 'paddlePayButtonController',
      scope: {
        paddleProduct: "=",
        callback: "&",
        userId: '<',
        buttonLabel: '@',
        buttonClass: '@',
        userEmail: '=',
        planDuration: '=',
        isTrial: '='
      }
    };
    return directive;
  }
}

class PaddlePayButtonController {
  constructor($rootScope, $scope, $window, $timeout, $q, $state, paymentsService, modalService) {
    'ngInject';
    this.$scope = $scope;
    this.$window = $window;
    this.$timeout = $timeout;
    this.$q = $q;
    this.$state = $state;
    this.paymentsService = paymentsService;
    this.handler = {};
    this.modalService = modalService;

    this.btnIconClasses = {
      normal: "glyphicon glyphicon-shopping-cart",
      loading: "glyphicon glyphicon-refresh"
    };

    this.btnIconClass = this.btnIconClasses.normal;

    this.product = this.$scope.paddleProduct;
    this.callback = this.$scope.callback;
    this.userId = this.$scope.userId;
    this.buttonLabel = this.$scope.buttonLabel;
    this.buttonClass = this.$scope.buttonClass;
    this.userEmail = this.$scope.userEmail || '';
    this.planDuration = this.$scope.planDuration;
    this.isTrial = this.$scope.isTrial;

    this.init();
  }

  init() {
    this.initButtonUI();
  }

  initButtonUI() {
    if (this.buttonLabel === undefined) {
      this.buttonLabel = "Buy now";
    }
  }

  startLoading() {
    this.btnIconClass = this.btnIconClass.loading;
  }

  stopLoading() {
    this.btnIconClass = this.btnIconClasses.normal;
  }

  initDestroyer() {
    //
  }

  getPaddleProductId(){
    if(this.product.prices === undefined || this.planDuration === undefined){
      return undefined;
    }
    return this.product.prices[this.planDuration].paddleId;
  }
  
  getTrialParameters(){
    if(this.product.prices === undefined || this.planDuration === undefined){
      return undefined;
    }
    var trialParameters = {"trialDays":"", "trialDaysAuth":"", "trialAuth":""};
    if (this.product.prices[this.planDuration].trial.trialEnabled && this.product.prices[this.planDuration].trial.trialDays && this.product.prices[this.planDuration].trial.trialDaysAuth && this.product.prices[this.planDuration].trial.trialAuth) {
      trialParameters.trialDays = this.product.prices[this.planDuration].trial.trialDays;
      trialParameters.trialDaysAuth = this.product.prices[this.planDuration].trial.trialDaysAuth;
      trialParameters.trialAuth = this.product.prices[this.planDuration].trial.trialAuth;
    }
    return trialParameters;
  }

  handlePayment() {
    var paddleId = this.getPaddleProductId();
    var trialDays = '';
    var trialDaysAuth = '';
    var trialPrice = '';
    var trialAuth = '';
    if (this.isTrial) {
      var trialParameters = this.getTrialParameters();
      trialDays = trialParameters.trialDays;
      trialDaysAuth = trialParameters.trialDaysAuth;
      trialAuth = trialParameters.trialAuth;
      trialPrice = 0;
    }

    if(paddleId === undefined || !Number.isInteger(paddleId) ){
      alert("Error, no transaction occurred, no paddleId found.");
      return;
    }
    /* jshint ignore:start */
    Paddle.Checkout.open({
      product: paddleId,
      email: this.userEmail,
      passthrough: { "email": this.userEmail, "uid": this.userId },
      trialDays: trialDays,
      trialDaysAuth: trialDaysAuth,
      price: trialPrice,
      auth:trialAuth,
      successCallback: (data) => {
        this.successCallback(data);
      },
      closeCallback: (data) => {
        this.closeCallback(data);
      },
    }, false);
    /* jshint ignore:end */
  }

  successCallback(data) {
    console.log(data);
    this.$state.go('myvolumio.payment-success');
    // TEMPORARY FIX FOR PADDLE CALLBACK
    /*
    if (data.checkout.completed) {
      var checkoutId = data.checkout.id;
      //Paddle.Order.DetailsPopup(data.checkout.id);
      this.$state.go('myvolumio.payment-success');
      return;
    } else {
      this.modalService.openDefaultErrorModal('MYVOLUMIO.PAYMENT_FAIL');
    }
    */
  }

  closeCallback(error) {
    this.modalService.openDefaultErrorModal('MYVOLUMIO.COMPLETE_CHECKOUT');
  }

}

export default PaddlePayButtonDirective;
