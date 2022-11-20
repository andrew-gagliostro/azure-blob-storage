import { DataLakeServiceClient } from '@azure/storage-file-datalake';
import { ChainedTokenCredential, DefaultAzureCredential, ManagedIdentityCredential } from '@azure/identity';
import * as fs from "fs";

export type clientInput = {
  blob_cs: string,
  managed_identity_toggle: boolean,
}

export class AzureBlobClient {
  blob_cs: string;
  managed_identity_toggle: boolean;
  managed_identity?: ManagedIdentityCredential;
  credential_chain?: ChainedTokenCredential;
  default_credential?: DefaultAzureCredential;



  constructor(input: clientInput) {
    this.blob_cs = input.blob_cs;
    this.managed_identity_toggle = input.managed_identity_toggle //os.environ.get("managed_identity");

    if (this.managed_identity_toggle) {
      this.managed_identity = new ManagedIdentityCredential();
      this.credential_chain = new ChainedTokenCredential(this.managed_identity);
      this.default_credential = new DefaultAzureCredential();
    }
  }

  public async store_document(path_full: string, file_obj: File | null, fileSystemName: string) {
    var datalake_service_client, dir_client, file_client, file_system_client, file_name, path_base;
    path_base = path_full.split("/", 1)[0];
    file_name = path_full.split("/", 1)[1];
    datalake_service_client = DataLakeServiceClient.fromConnectionString(this.blob_cs);
    //file_system_client = datalake_service_client.getFileSystemClient(fileSystemName);
    // dir_client = file_system_client (path_base);
    // file_client = dir_client.create_file(filename);
    file_system_client = datalake_service_client.getFileSystemClient(fileSystemName);
    dir_client = file_system_client.getDirectoryClient(path_base);
    file_client = dir_client.getFileClient(file_name)


    if (file_obj !== null) {
      file_client.append(file_obj, 0, file_obj.size);
      file_client.flush(file_obj.size);
    } else {
      const data = fs.readFileSync(path_full)
      file_client.append(data, 0, data.length);
      file_client.flush(data.length);
    }

    return true;
  }

  public async fetch_document(path_full: string, fileSystemName: string) {
    var path_base;
    path_base = path_full.split("/", 1)[0];
    file_name = path_full.split("/", 1)[1];
    fs.mkdir(path_base, (err) => {
      if (err) {
          return console.error(err);
      }
      console.log('Directory created successfully!');
    });
    var datalake_service_client, dir_client, file_client, file_system_client, file_name;

    datalake_service_client = DataLakeServiceClient.fromConnectionString(this.blob_cs);
    file_system_client = datalake_service_client.getFileSystemClient(fileSystemName);
    dir_client = file_system_client.getDirectoryClient(path_base);
    file_client = dir_client.getFileClient(file_name)

    // if (this.managed_identity_toggle === true) {
    //   file_client = new DataLakeFileClient(file );
    // } else {
    //   file_client = DataLakeFileClient.from_connection_string(this.blob_cs, {
    //     "file_system_name": "engine",
    //     "file_path": path_full
    //   });
    //   download = file_client.download_file();
    //   download.readinto(file);
    // }

    return true;
  }

}