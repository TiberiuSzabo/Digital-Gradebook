# Etapa de build
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /app

# Copiem TOT ce e in server-dotnet (WebApi, Service, Repository)
COPY . ./

# Intram in folderul WebApi si il compilam
RUN dotnet publish DigitalGradebook.WebApi/DigitalGradebook.WebApi.csproj -c Release -o out

# Etapa de rulare
FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=build /app/out .

EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080

ENTRYPOINT ["dotnet", "DigitalGradebook.WebApi.dll"]