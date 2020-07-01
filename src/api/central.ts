import { IIoTCClient } from "react-native-azure-iotcentral-client";
import { bleToIoTCName } from "../utils";

export async function getCredentialsFromNumericCode(numeric: string): Promise<string> {
    return (await fetch(`http://cpm-cred-server.azurewebsites.net/numeric?numeric=${numeric}`)).text();
}

export async function sendTelemetryData(centralClient: IIoTCClient, normalize: boolean, itemData: { itemId: string, value: any, itemName: string }): Promise<void> {
    const itemKey = normalize ? bleToIoTCName(itemData.itemId) : itemData.itemId;
    await centralClient.sendTelemetry({ [itemKey]: itemData.value });
}