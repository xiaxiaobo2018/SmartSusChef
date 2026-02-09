using System.ComponentModel.DataAnnotations;

namespace SmartSusChef.Api.DTOs;

public record LoginRequest(
    [property: Required] string Username,
    [property: Required] string Password
);

public record LoginResponse(string Token, UserDto User, bool StoreSetupRequired);

public record UserDto(
    string Id,
    string Username,
    string Name,
    string Email,
    string Role,
    string Status,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

// Registration DTOs
public record RegisterManagerRequest(
    [property: Required][property: StringLength(50, MinimumLength = 3)] string Username,
    [property: Required]
    [property: StringLength(36, MinimumLength = 12, ErrorMessage = "Password must be between 12 and 36 characters long.")]
    [property: RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#\^()\-_=+\[\]{}|;:',.<>\/~`]).{12,36}$",
        ErrorMessage = "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.")]
    string Password,
    [property: Required][property: StringLength(100, MinimumLength = 2)][property: RegularExpression(@"^[\p{L}\p{M}\s\-\']+$", ErrorMessage = "Name can only contain letters, spaces, hyphens, and apostrophes.")] string Name,
    [property: Required][property: EmailAddress][property: RegularExpression(@"^[^@\s]+@[^@\s]+\.[^@\s]+$", ErrorMessage = "Invalid email format.")] string Email
);

public record RegisterResponse(string Token, UserDto User, bool StoreSetupRequired);

// Registration result for better error handling
public enum RegisterErrorType
{
    None,
    UsernameExists,
    ManagerAlreadyExists
}

public record RegisterResult(RegisterResponse? Response, RegisterErrorType ErrorType);

// User management DTOs
public record CreateUserRequest(
    [property: Required][property: StringLength(50, MinimumLength = 3)] string Username,
    [property: Required]
    [property: StringLength(36, MinimumLength = 12, ErrorMessage = "Password must be between 12 and 36 characters long.")]
    [property: RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#\^()\-_=+\[\]{}|;:',.<>\/~`]).{12,36}$",
        ErrorMessage = "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.")]
    string Password,
    [property: Required][property: StringLength(100, MinimumLength = 2)][property: RegularExpression(@"^[\p{L}\p{M}\s\-\']+$", ErrorMessage = "Name can only contain letters, spaces, hyphens, and apostrophes.")] string Name,
    [property: Required][property: EmailAddress][property: RegularExpression(@"^[^@\s]+@[^@\s]+\.[^@\s]+$", ErrorMessage = "Invalid email format.")] string Email,
    [property: Required] string Role // "manager" or "employee"
);

public record UpdateUserRequest(
    [property: StringLength(50, MinimumLength = 3)] string? Username,
    [property: StringLength(36, MinimumLength = 12, ErrorMessage = "Password must be between 12 and 36 characters long.")]
    [property: RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#\^()\-_=+\[\]{}|;:',.<>\/~`]).{12,36}$",
        ErrorMessage = "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.")]
    string? Password,
    [property: StringLength(100, MinimumLength = 2)][property: RegularExpression(@"^[\p{L}\p{M}\s\-\']+$", ErrorMessage = "Name can only contain letters, spaces, hyphens, and apostrophes.")] string? Name,
    [property: EmailAddress][property: RegularExpression(@"^[^@\s]+@[^@\s]+\.[^@\s]+$", ErrorMessage = "Invalid email format.")] string? Email,
    string? Role,
    string? Status // "Active" or "Inactive"
);

public record UpdateProfileRequest(
    [property: StringLength(100, MinimumLength = 2)][property: RegularExpression(@"^[\p{L}\p{M}\s\-\']+$", ErrorMessage = "Name can only contain letters, spaces, hyphens, and apostrophes.")] string? Name,
    [property: EmailAddress][property: RegularExpression(@"^[^@\s]+@[^@\s]+\.[^@\s]+$", ErrorMessage = "Invalid email format.")] string? Email
);

public record ChangePasswordRequest(
    [property: Required] string CurrentPassword,
    [property: Required]
    [property: StringLength(36, MinimumLength = 12, ErrorMessage = "Password must be between 12 and 36 characters long.")]
    [property: RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#\^()\-_=+\[\]{}|;:',.<>\/~`]).{12,36}$",
        ErrorMessage = "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.")]
    string NewPassword
);

public record ForgotPasswordRequest(
    [property: Required] string EmailOrUsername
);

public record ForgotPasswordResponse(
    string Message
);

public record UserListDto(
    string Id,
    string Username,
    string Name,
    string Email,
    string Role,
    string Status,
    DateTime CreatedAt,
    DateTime UpdatedAt
);
