import { AzureBlobClient } from '../src';

describe('blah', () => {
  it('works', () => {
    let client = new AzureBlobClient({blob_cs: "UseDevelopmentStorage=true", managed_identity_toggle: false});
    console.log("test pass")
  });
});
