const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/bmp",
];
const ALLOWED_VIDEO_TYPES = [
  "video/mp4",
  "video/mpeg",
  "video/quicktime",
  "video/x-msvideo",
  "video/webm",
];

const VALID_STATUSES = ["new", "in_progress", "resolved"];

export function validateTicket(ticketData) {
  const errors = {};

  // Validate category using validateCategory helper
  const categoryValidation = validateCategory(ticketData.category,ticketData.role);
  if (!categoryValidation.isValid) {
    errors.category = categoryValidation.error;
  }

  // Validate description using validateDescription helper
  const descriptionValidation = validateDescription(ticketData.description);
  if (!descriptionValidation.isValid) {
    errors.description = descriptionValidation.error;
  }

  // Validate file using validateFile helper
  if (ticketData.file) {
    const fileValidation = validateFile(ticketData.file);
    if (!fileValidation.isValid) {
      errors.file = fileValidation.error;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateCategory(category,role) {

  const validCategories = {
  "Player": [
  "redeem",
  "recharge",
  "wallet",
  "login",
  "password",
  "others",
  ],
  "Master-Agent": [
    "user_management",
    "summary_reports",
    "recharge_records",
    "redeem_records",
    "balance_display",
    "recharge_limit",
    "master_accounting",
    "login",
    "others",
  ],
  "Agent": [
    "user_management",
    "summary_reports",
    "recharge_records",
    "redeem_records",
    "balance_display",
    "recharge_limit",
    "login",
    "others",
  ],
};

  if (!category) {
    return {
      isValid: false,
      error: "Category is required",
    };
  }
  if (!role) {
    return {
      isValid: false,
      error: "Role is required",
    };
  }

  if (!validCategories[role].includes(category.toLowerCase())) {
    return {
      isValid: false,
      error: "Invalid category selected",
    };
  }

  return {
    isValid: true,
    error: null,
  };
}

export function validateDescription(description) {
  if (!description || !description.trim()) {
    return {
      isValid: false,
      error: "Description is required",
    };
  }

  const trimmedDescription = description.trim();

  if (trimmedDescription.length < 10) {
    return {
      isValid: false,
      error: "Description must be at least 10 characters",
    };
  }

  if (trimmedDescription.length > 1000) {
    return {
      isValid: false,
      error: "Description must not exceed 1000 characters",
    };
  }

  return {
    isValid: true,
    error: null,
  };
}

export function validateFile(file) {
  if (!file) {
    return {
      isValid: true,
      error: null,
    };
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: "File size must be less than 25MB",
    };
  }

  // Check file type
  const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
  const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);

  if (!isImage && !isVideo) {
    return {
      isValid: false,
      error:
        "Only image files (JPEG, PNG, GIF, WebP, BMP) and video files (MP4, MPEG, MOV, AVI, WebM) are allowed",
    };
  }

  return {
    isValid: true,
    error: null,
  };
}

export const TICKET_CONSTANTS = {
  MAX_FILE_SIZE,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_VIDEO_TYPES,
  MIN_DESCRIPTION_LENGTH: 10,
  MAX_DESCRIPTION_LENGTH: 1000,
};

export function validateTicketUpdate(updateData) {
  const errors = {};

  // Validate status using validateStatus helper
  const statusValidation = validateStatus(updateData.status);
  if (!statusValidation.isValid) {
    errors.status = statusValidation.error;
  }

  // Validate remarks using validateRemarks helper
  if (updateData.remarks !== undefined && updateData.remarks !== null) {
    const remarksValidation = validateRemarks(updateData.remarks);
    if (!remarksValidation.isValid) {
      errors.remarks = remarksValidation.error;
    }
  }

  // Validate ticketId
  if (!updateData.ticketId) {
    errors.ticketId = "Ticket ID is required";
  } else if (
    typeof updateData.ticketId !== "string" ||
    updateData.ticketId.trim().length === 0
  ) {
    errors.ticketId = "Invalid Ticket ID";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateStatus(status) {
  if (!status) {
    return {
      isValid: false,
      error: "Status is required",
    };
  }

  if (!VALID_STATUSES.includes(status.toLowerCase())) {
    return {
      isValid: false,
      error: `Status must be one of: ${VALID_STATUSES.join(", ")}`,
    };
  }

  return {
    isValid: true,
    error: null,
  };
}

export function validateRemarks(remarks) {
  // Remarks are optional
  if (!remarks || remarks.trim().length === 0) {
    return {
      isValid: true,
      error: null,
    };
  }

  if (typeof remarks !== "string") {
    return {
      isValid: false,
      error: "Remarks must be a string",
    };
  }

  const trimmedRemarks = remarks.trim();

  if (trimmedRemarks.length < 5) {
    return {
      isValid: false,
      error: "Remarks must be at least 5 characters long",
    };
  }

  if (trimmedRemarks.length > 500) {
    return {
      isValid: false,
      error: "Remarks must not exceed 500 characters",
    };
  }

  return {
    isValid: true,
    error: null,
  };
}

export const TICKET_UPDATE_CONSTANTS = {
  VALID_STATUSES,
  MIN_REMARKS_LENGTH: 5,
  MAX_REMARKS_LENGTH: 500,
};

