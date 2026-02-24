FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY ["AlcoCalendar.Api/AlcoCalendar.Api.csproj", "AlcoCalendar.Api/"]
COPY ["AlcoCalendar.Application/AlcoCalendar.Application.csproj", "AlcoCalendar.Application/"]
COPY ["AlcoCalendar.Domain/AlcoCalendar.Domain.csproj", "AlcoCalendar.Domain/"]
COPY ["AlcoCalendar.Infrastructure/AlcoCalendar.Infrastructure.csproj", "AlcoCalendar.Infrastructure/"]

RUN dotnet restore "AlcoCalendar.Api/AlcoCalendar.Api.csproj"

COPY . .
RUN dotnet publish "AlcoCalendar.Api/AlcoCalendar.Api.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "AlcoCalendar.Api.dll"]

