namespace AlcoCalendar.Application.Calendar;

public sealed class CalendarValidationException : Exception
{
    public CalendarValidationException(string message) : base(message) { }
}

public sealed class CalendarNotFoundException : Exception
{
    public CalendarNotFoundException(string message) : base(message) { }
}
