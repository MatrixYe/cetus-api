import CetusClmmSDK, { SdkOptions } from "@cetusprotocol/cetus-sui-clmm-sdk";

const mainnet = {
  // 测试的key
  // fullRpcUrl: "https://sui-mainnet-rpc.allthatnode.com/NDfmRHNd7Tdx20YZGR2MVU4EFs2I9dDD",
  fullRpcUrl: "https://sui-mainnet.g.allthatnode.com/full/json_rpc/996ab4737fad47a8b4367e0b954474f3",

  swapCountUrl: "https://api-sui.cetus.zone/v2/sui/swap/count",
  simulationAccount: {
    address: "0x60c7f6c6173a38e7d68efe0c2519ec37e466275bbf0d6a3b62a1b8fc6b12004c"
  },
  cetus_config: {
    package_id: "0x95b8d278b876cae22206131fb9724f701c9444515813042f54f0a426c9a3bc2f",
    published_at: "0x95b8d278b876cae22206131fb9724f701c9444515813042f54f0a426c9a3bc2f",
    config: {
      coin_list_id: "0x8cbc11d9e10140db3d230f50b4d30e9b721201c0083615441707ffec1ef77b23",
      launchpad_pools_id: "0x1098fac992eab3a0ab7acf15bb654fc1cf29b5a6142c4ef1058e6c408dd15115",
      clmm_pools_id: "0x15b6a27dd9ae03eb455aba03b39e29aad74abd3757b8e18c0755651b2ae5b71e",
      admin_cap_id: "0x39d78781750e193ce35c45ff32c6c0c3f2941fa3ddaf8595c90c555589ddb113",
      global_config_id: "0x0408fa4e4a4c03cc0de8f23d0c2bbfe8913d178713c9a271ed4080973fe42d8f",
      coin_list_handle: "0x49136005e90e28c4695419ed4194cc240603f1ea8eb84e62275eaff088a71063",
      launchpad_pools_handle: "0x5e194a8efcf653830daf85a85b52e3ae8f65dc39481d54b2382acda25068375c",
      clmm_pools_handle: "0x37f60eb2d9d227949b95da8fea810db3c32d1e1fa8ed87434fc51664f87d83cb"
    }
  },
  clmm_pool: {
    package_id: "0x1eabed72c53feb3805120a081dc15963c204dc8d091542592abaf7a35689b2fb",
    published_at: "0x70968826ad1b4ba895753f634b0aea68d0672908ca1075a2abdf0fc9e0b2fc6a",
    config: {
      pools_id: "0xf699e7f2276f5c9a75944b37a0c5b5d9ddfd2471bf6242483b03ab2887d198d0",
      global_config_id: "0xdaa46292632c3c4d8f31f23ea0f9b36a28ff3677e9684980e4438403a67a3d8f",
      global_vault_id: "0xce7bceef26d3ad1f6d9b6f13a953f053e6ed3ca77907516481ce99ae8e588f2b",
      admin_cap_id: "0x89c1a321291d15ddae5a086c9abc533dff697fde3d89e0ca836c41af73e36a75",
      partners_id: "0xac30897fa61ab442f6bff518c5923faa1123c94b36bd4558910e9c783adfa204"
    }
  },
  integrate: {
    package_id: "0x996c4d9480708fb8b92aa7acf819fb0497b5ec8e65ba06601cae2fb6db3312c3",
    published_at: "0x6f5e582ede61fe5395b50c4a449ec11479a54d7ff8e0158247adfda60d98970b"
  },
  deepbook: {
    package_id: "0x000000000000000000000000000000000000000000000000000000000000dee9",
    published_at: "0x000000000000000000000000000000000000000000000000000000000000dee9"
  },
  deepbook_endpoint_v2: {
    package_id: "0x0dd416959739e1db3a4c6f9cac7f9e7202678f3b067d6d419e569a124fc35e0e",
    published_at: "0x0dd416959739e1db3a4c6f9cac7f9e7202678f3b067d6d419e569a124fc35e0e"
  },
  aggregatorUrl: "https://api-sui.cetus.zone/router"
};

const clmmTestnet: SdkOptions = {
  fullRpcUrl: "https://fullnode.testnet.sui.io",
  swapCountUrl: "https://api-sui.devcetus.com/v2/sui/swap/count",
  simulationAccount: {
    address: "0x60c7f6c6173a38e7d68efe0c2519ec37e466275bbf0d6a3b62a1b8fc6b12004c"
  },
  cetus_config: {
    package_id:
      "0xf5ff7d5ba73b581bca6b4b9fa0049cd320360abd154b809f8700a8fd3cfaf7ca",
    published_at:
      "0xf5ff7d5ba73b581bca6b4b9fa0049cd320360abd154b809f8700a8fd3cfaf7ca",
    config: {
      coin_list_id:
        "0x257eb2ba592a5480bba0a97d05338fab17cc3283f8df6998a0e12e4ab9b84478",
      launchpad_pools_id:
        "0xdc3a7bd66a6dcff73c77c866e87d73826e446e9171f34e1c1b656377314f94da",
      clmm_pools_id:
        "0x26c85500f5dd2983bf35123918a144de24e18936d0b234ef2b49fbb2d3d6307d",
      admin_cap_id:
        "0x1a496f6c67668eb2c27c99e07e1d61754715c1acf86dac45020c886ac601edb8",
      global_config_id:
        "0xe1f3db327e75f7ec30585fa52241edf66f7e359ef550b533f89aa1528dd1be52",
      coin_list_handle:
        "0x3204350fc603609c91675e07b8f9ac0999b9607d83845086321fca7f469de235",
      launchpad_pools_handle:
        "0xae67ff87c34aceea4d28107f9c6c62e297a111e9f8e70b9abbc2f4c9f5ec20fd",
      clmm_pools_handle:
        "0xd28736923703342b4752f5ed8c2f2a5c0cb2336c30e1fed42b387234ce8408ec"
    }
  },
  clmm_pool: {
    package_id:
      "0x0868b71c0cba55bf0faf6c40df8c179c67a4d0ba0e79965b68b3d72d7dfbf666",
    published_at:
      "0x1c29d658882c40eeb39a8bb8fe58f71a216a918acb3e3eb3b47d24efd07257f2",
    config: {
      pools_id:
        "0xc090b101978bd6370def2666b7a31d7d07704f84e833e108a969eda86150e8cf",
      global_config_id:
        "0x6f4149091a5aea0e818e7243a13adcfb403842d670b9a2089de058512620687a",
      global_vault_id:
        "0xf3114a74d54cbe56b3e68f9306661c043ede8c6615f0351b0c3a93ce895e1699",
      admin_cap_id:
        "0xa456f86a53fc31e1243f065738ff1fc93f5a62cc080ff894a0fb3747556a799b",
      partners_id:
        "0xb1cefb6de411213a1cfe94d24213af2518eff3d51267fb95e35d11aa77fc9b5f"
    }
  },
  integrate: {
    package_id:
      "0x8627c5cdcd8b63bc3daa09a6ab7ed81a829a90cafce6003ae13372d611fbb1a9",
    published_at:
      "0xf1a5d0c5b0593e41d13f9684ca91365bdfe54a98836c1d33c90e361a031fac74"
  },
  deepbook: {
    package_id:
      "0x000000000000000000000000000000000000000000000000000000000000dee9",
    published_at:
      "0x000000000000000000000000000000000000000000000000000000000000dee9"
  },
  deepbook_endpoint_v2: {
    package_id:
      "0xa34ffca2c6540e1ca9e53963ab43e7b1eed7b82e37696c743bb7c6179c15dfa6",
    published_at:
      "0xa34ffca2c6540e1ca9e53963ab43e7b1eed7b82e37696c743bb7c6179c15dfa6"
  },
  aggregatorUrl: "https://api-sui.devcetus.com/router"
};


export function selectSDK(network: string, senderAddress: string) {

  switch (network) {
    case "mainnet": {
      let sdk = new CetusClmmSDK(mainnet);
      sdk.senderAddress = senderAddress;

      return sdk;
    }
    case "devnet": {
      let sdk = new CetusClmmSDK(clmmTestnet);
      sdk.senderAddress = senderAddress;
      return sdk;
    }
    default: {
      return null;
    }
  }
}