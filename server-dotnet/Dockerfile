# Etapa de build
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /app

# Copiem TOT ce e in server-dotnet
COPY . ./

# Intram in folderul WebApi si il compilam
RUN dotnet publish DigitalGradebook.WebApi/DigitalGradebook.WebApi.csproj -c Release -o out

# Etapa de rulare
FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=build /app/out .

# FORTAM COPIEREA BAZEI DE DATE DE PE LAPTOP!
COPY --from=build /app/DigitalGradebook.WebApi/gradebook.db .

EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080

ENTRYPOINT ["dotnet", "DigitalGradebook.WebApi.dll"]