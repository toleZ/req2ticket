using System.ComponentModel.DataAnnotations;

namespace Web.DTOs.Validation;

/* For every password someone chooses (register, creating a user, changing your own): 8 to 72
   characters with an uppercase letter, a number and a special character (ENT-6). Not for logging
   in: there the only rule is that something was typed.

   72 is BCrypt's limit: it silently ignores everything past 72 bytes, so a longer password would be
   accepted and then only partly checked. Null passes here — [Required] is a separate decision. */
public sealed class StrongPasswordAttribute : ValidationAttribute
{
    public StrongPasswordAttribute()
        : base("The password must be 8 to 72 characters and include an uppercase letter, a number and a special character.")
    {
    }

    public override bool IsValid(object? value)
    {
        if (value is not string password)
        {
            return true;
        }

        return password.Length is >= 8 and <= 72
            && password.Any(char.IsUpper)
            && password.Any(char.IsDigit)
            && password.Any(c => !char.IsLetterOrDigit(c));
    }
}
