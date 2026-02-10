using System.ComponentModel.DataAnnotations;

namespace SmartSusChef.Api.DTOs;

public record LoginRequest(
    [param: Required] string Username,
    [param: Required] string Password
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
    [param: Required][param: StringLength(50, MinimumLength = 3)] string Username,
    [param: Required]
    [param: StringLength(36, MinimumLength = 12, ErrorMessage = "Password must be between 12 and 36 characters long.")]
    [param: RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#\^()\-_=+\[\]{}|;:',.<>\/~`]).{12,36}$",
        ErrorMessage = "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.")]
    string Password,
    [param: Required][param: StringLength(100, MinimumLength = 2)][param: RegularExpression(@"^[\p{L}\p{M}\s\-\']+$", ErrorMessage = "Name can only contain letters, spaces, hyphens, and apostrophes.")] string Name,
    [param: Required][param: EmailAddress][param: RegularExpression(@"^[^@\s]+@[^@\s]+\.[^@\s]+$", ErrorMessage = "Invalid email format.")] string Email
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
    [param: Required][param: StringLength(50, MinimumLength = 3)] string Username,
    [param: Required]
    [param: StringLength(36, MinimumLength = 12, ErrorMessage = "Password must be between 12 and 36 characters long.")]
    [param: RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#\^()\-_=+\[\]{}|;:',.<>\/~`]).{12,36}$",
        ErrorMessage = "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.")]
    string Password,
    [param: Required][param: StringLength(100, MinimumLength = 2)][param: RegularExpression(@"^[\p{L}\p{M}\s\-\']+$", ErrorMessage = "Name can only contain letters, spaces, hyphens, and apostrophes.")] string Name,
    [param: Required][param: EmailAddress][param: RegularExpression(@"^[^@\s]+@[^@\s]+\.[^@\s]+$", ErrorMessage = "Invalid email format.")] string Email,
    [param: Required] string Role // "manager" or "employee"
);

public record UpdateUserRequest(
    [param: StringLength(50, MinimumLength = 3)] string? Username,
    [param: StringLength(36, MinimumLength = 12, ErrorMessage = "Password must be between 12 and 36 characters long.")]
    [param: RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#\^()\-_=+\[\]{}|;:',.<>\/~`]).{12,36}$",
        ErrorMessage = "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.")]
    string? Password,
    [param: StringLength(100, MinimumLength = 2)][param: RegularExpression(@"^[\p{L}\p{M}\s\-\']+$", ErrorMessage = "Name can only contain letters, spaces, hyphens, and apostrophes.")] string? Name,
    [param: EmailAddress][param: RegularExpression(@"^[^@\s]+@[^@\s]+\.[^@\s]+$", ErrorMessage = "Invalid email format.")] string? Email,
    string? Role,
    string? Status // "Active" or "Inactive"
);

public record UpdateProfileRequest(
    [param: StringLength(100, MinimumLength = 2)][param: RegularExpression(@"^[\p{L}\p{M}\s\-\']+$", ErrorMessage = "Name can only contain letters, spaces, hyphens, and apostrophes.")] string? Name,
    [param: EmailAddress][param: RegularExpression(@"^[^@\s]+@[^@\s]+\.[^@\s]+$", ErrorMessage = "Invalid email format.")] string? Email
);

public record ChangePasswordRequest(
    [param: Required] string CurrentPassword,
    [param: Required]
    [param: StringLength(36, MinimumLength = 12, ErrorMessage = "Password must be between 12 and 36 characters long.")]
    [param: RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#\^()\-_=+\[\]{}|;:',.<>\/~`]).{12,36}$",
        ErrorMessage = "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.")]
    string NewPassword
);

public record ForgotPasswordRequest(
    [param: Required] string EmailOrUsername
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
