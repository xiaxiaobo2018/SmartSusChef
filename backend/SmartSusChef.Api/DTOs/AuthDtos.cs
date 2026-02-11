using System.ComponentModel.DataAnnotations;

namespace SmartSusChef.Api.DTOs;

public record LoginRequest(
    [Required] string Username,
    [Required] string Password
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
    [Required][StringLength(50, MinimumLength = 3)] string Username,
    [Required]
    [StringLength(36, MinimumLength = 12, ErrorMessage = "Password must be between 12 and 36 characters long.")]
    [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#\^()\-_=+\[\]{}|;:',.<>\/~`]).{12,36}$",
        ErrorMessage = "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.")]
    string Password,
    [Required][StringLength(100, MinimumLength = 2)][RegularExpression(@"^[\p{L}\p{M}\s\-\']+$", ErrorMessage = "Name can only contain letters, spaces, hyphens, and apostrophes.")] string Name,
    [Required][EmailAddress][RegularExpression(@"^[^@\s]+@[^@\s]+\.[^@\s]+$", ErrorMessage = "Invalid email format.")] string Email
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
public class CreateUserRequest
{
    [Required]
    [StringLength(50, MinimumLength = 3)]
    public string Username { get; set; } = string.Empty;

    [Required]
    [StringLength(36, MinimumLength = 12, ErrorMessage = "Password must be between 12 and 36 characters long.")]
    [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#\^()\-_=+\[\]{}|;:',.<>\/~`]).{12,36}$",
        ErrorMessage = "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.")]
    public string Password { get; set; } = string.Empty;

    [Required]
    [StringLength(100, MinimumLength = 2)]
    [RegularExpression(@"^[\p{L}\p{M}\s\-\']+$", ErrorMessage = "Name can only contain letters, spaces, hyphens, and apostrophes.")]
    public string Name { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    [RegularExpression(@"^[^@\s]+@[^@\s]+\.[^@\s]+$", ErrorMessage = "Invalid email format.")]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string Role { get; set; } = string.Empty; // "manager" or "employee"
}

public class UpdateUserRequest
{
    [StringLength(50, MinimumLength = 3)]
    public string? Username { get; set; }

    [StringLength(36, MinimumLength = 12, ErrorMessage = "Password must be between 12 and 36 characters long.")]
    [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#\^()\-_=+\[\]{}|;:',.<>\/~`]).{12,36}$",
        ErrorMessage = "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.")]
    public string? Password { get; set; }

    [StringLength(100, MinimumLength = 2)]
    [RegularExpression(@"^[\p{L}\p{M}\s\-\']+$", ErrorMessage = "Name can only contain letters, spaces, hyphens, and apostrophes.")]
    public string? Name { get; set; }

    [EmailAddress]
    [RegularExpression(@"^[^@\s]+@[^@\s]+\.[^@\s]+$", ErrorMessage = "Invalid email format.")]
    public string? Email { get; set; }

    public string? Role { get; set; }

    public string? Status { get; set; } // "Active" or "Inactive"
}

public class UpdateProfileRequest
{
    [StringLength(100, MinimumLength = 2)]
    [RegularExpression(@"^[\p{L}\p{M}\s\-\']+$", ErrorMessage = "Name can only contain letters, spaces, hyphens, and apostrophes.")]
    public string? Name { get; set; }

    [EmailAddress]
    [RegularExpression(@"^[^@\s]+@[^@\s]+\.[^@\s]+$", ErrorMessage = "Invalid email format.")]
    public string? Email { get; set; }
}

public class ChangePasswordRequest
{
    [Required]
    public string CurrentPassword { get; set; } = string.Empty;

    [Required]
    [StringLength(36, MinimumLength = 12, ErrorMessage = "Password must be between 12 and 36 characters long.")]
    [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#\^()\-_=+\[\]{}|;:',.<>\/~`]).{12,36}$",
        ErrorMessage = "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.")]
    public string NewPassword { get; set; } = string.Empty;
}

public record ForgotPasswordRequest(
    [Required] string EmailOrUsername
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
