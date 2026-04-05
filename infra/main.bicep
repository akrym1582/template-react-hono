targetScope = 'resourceGroup'

param appName string
param location string = resourceGroup().location
param sku string = 'B1'
param cosmosAccountName string = '${appName}-cosmos'
param storageAccountName string = '${toLower(replace(appName, '-', ''))}st'

module appService 'modules/app-service.bicep' = {
  name: 'appService'
  params: {
    appName: appName
    location: location
    sku: sku
  }
}

module cosmosDb 'modules/cosmos-db.bicep' = {
  name: 'cosmosDb'
  params: {
    accountName: cosmosAccountName
    location: location
  }
}

module storage 'modules/storage.bicep' = {
  name: 'storage'
  params: {
    accountName: storageAccountName
    location: location
  }
}
