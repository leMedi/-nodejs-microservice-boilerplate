export const ZagEndPoints = {
  LOGIN: 'LoginSecureBrokerAPI.php',
  CHECK_SESSION: 'DBDateTimeAPI.php',

  CREATE_USER: 'Custom/CreateUserAPI.php',
  DELETE_USER: 'Custom/DeleteClientAPI.php',
  USER_INQUIRY: 'Custom/UsersInquiryAPI.php',
  DEPOSIT: 'custom/finamaze/depositapi.php',

  CREATE_STRUCTURED_PRODUCT:
    'StructuredProducts/CreateNewStructuredProduct.php',
  LIST_STRUCTURED_PRODUCTS: 'StructuredProducts/ListStructuredProducts.php',

  PLACE_ORDER: 'json/PlaceOrderAPI_json.php',
  CHANGE_ORDER_STATUS: 'json/ChangeOrderStatusAPI_json.php'
}

export const ZagResponses = {
  AUTHENTIFICATION_SUCCESS: '93',

  /// //////
  // Errors

  /** session */
  SESSION_EXIPRED_ERROR: 'Error:Invalid Session',

  /** user  */
  $USER_ALREADY_EXISTS_ERROR: 'Already exist',
  $USER_DOES_NOT_EXIST_ERROR: 'This Client not exists',

  /** structrued product */
  $CREATE_SP_ERROR: 'you are looking for has been removed'
}

// #region Errors

export class ZagError extends Error {
  constructor(message, status) {
    // Calling parent constructor of base Error class.
    super(message)
    // Saving class name in the property of our custom error as a shortcut.
    this.name = this.constructor.name
    // `500` is the default value if not specified.
    this.status = status || 500
  }
}

export class ZagValidationError extends ZagError {
  constructor(message, status) {
    // Calling parent constructor of base Error class.
    super(message)
    // Saving class name in the property of our custom error as a shortcut.
    this.name = this.constructor.name

    this.status = status || 422
  }
}

export class ZagClientError extends ZagError {
  constructor(message, status) {
    // Calling parent constructor of base Error class.
    super(message)
    // Saving class name in the property of our custom error as a shortcut.
    this.name = this.constructor.name

    this.status = status || 500
  }
}

export class ZagStructuredProductError extends ZagError {
  constructor(message, status) {
    // Calling parent constructor of base Error class.
    super(message)
    // Saving class name in the property of our custom error as a shortcut.
    this.name = this.constructor.name

    this.status = status || 500
  }
}

export class ZagOrderError extends ZagError {
  constructor(message, status) {
    // Calling parent constructor of base Error class.
    super(message)
    // Saving class name in the property of our custom error as a shortcut.
    this.name = this.constructor.name

    this.status = status || 500
  }
}

export class ZagSessionError extends ZagError {
  constructor(message, status) {
    // Calling parent constructor of base Error class.
    super(message)
    // Saving class name in the property of our custom error as a shortcut.
    this.name = this.constructor.name

    this.status = status || 401
  }
}
// #endregion
