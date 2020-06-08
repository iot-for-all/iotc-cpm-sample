
export async function getCredentialsFromNumericCode(numeric: string): Promise<string> {
    return (await fetch(`http://cpm-cred-server.azurewebsites.net/numeric?numeric=${numeric}`)).text();
}