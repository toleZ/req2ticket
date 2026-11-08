using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace Web.Filters;

/* How a broken rule becomes a response, in one place instead of a try/catch in every action. The
   services throw and this answers, always as { message }, the shape the front end reads:

     ArgumentException            → 400  a business rule said no ("The epic still has open tickets.")
     UnauthorizedAccessException  → 403  allowed in general, but not this ("You can't delete your own account.")
     unique index violation       → 409  two requests raced past a check (e.g. starting two sprints)

   Anything else is a real bug and stays a 500. */
public class ApiExceptionFilter : IExceptionFilter
{
    public void OnException(ExceptionContext context)
    {
        switch (context.Exception)
        {
            case ArgumentException exception:
                context.Result = new BadRequestObjectResult(new { message = exception.Message });
                context.ExceptionHandled = true;
                break;

            case UnauthorizedAccessException exception:
                context.Result = new ObjectResult(new { message = exception.Message })
                {
                    StatusCode = StatusCodes.Status403Forbidden
                };
                context.ExceptionHandled = true;
                break;

            // The services check first, so this only happens when two requests pass the same check
            // at the same time. Never leak the index name: just say to try again.
            case DbUpdateException { InnerException: PostgresException { SqlState: PostgresErrorCodes.UniqueViolation } }:
                context.Result = new ConflictObjectResult(new { message = "Someone else just made a conflicting change. Try again." });
                context.ExceptionHandled = true;
                break;
        }
    }
}
