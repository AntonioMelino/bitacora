FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY Bitacora.API/Bitacora.API.csproj Bitacora.API/
COPY Bitacora.Application/Bitacora.Application.csproj Bitacora.Application/
COPY Bitacora.Domain/Bitacora.Domain.csproj Bitacora.Domain/
COPY Bitacora.Infrastructure/Bitacora.Infrastructure.csproj Bitacora.Infrastructure/
RUN dotnet restore Bitacora.API/Bitacora.API.csproj

COPY . .
RUN dotnet publish Bitacora.API/Bitacora.API.csproj -c Release -o /app/out --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /app/out .

ENTRYPOINT ["dotnet", "Bitacora.API.dll"]
