import { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519";

/**
 *
 * @param result 返回数据
 */
export function success(result: any) {
  return { code: 1, data: result, status: "success", msg: null };
}

/**
 *
 * @param msg 返回错误信息
 */
export function failed(msg: any) {
  return { code: 0, data: null, status: "failed", msg: msg };
}

/**
 *
 * @param arr 输入数组
 */
export function isArrayEmpty<T>(arr: T[]): boolean {
  return arr == null || arr.length == 0;
}

export function isNotArrayEmpty<T>(arr: T[]): boolean {
  return arr != null && arr.length != 0;
}

export function isNull(v) {
  return v == null;
}

export function isNotNull(v) {
  return v != null;
}

export function genKeypair(secretKey: string) {
  const u8arr = hexStringToUint8Array(secretKey);
  // console.log(u8arr);
  // return Secp256k1Keypair.fromSecretKey(u8arr);
  return Ed25519Keypair.fromSecretKey(u8arr);
}


function hexStringToUint8Array(hexString: string): Uint8Array {
  if (hexString.length % 2 !== 0) {
    throw new Error("十六进制字符串应该有偶数长度");
  }

  const arrayBuffer = new Uint8Array(hexString.length / 2);

  for (let i = 0; i < hexString.length; i += 2) {
    const byteValue = parseInt(hexString.substring(i, i + 2), 16);
    if (isNaN(byteValue)) {
      throw new Error(`十六进制字符串中包含非法字符: ${hexString.substring(i, i + 2)}`);
    }
    arrayBuffer[i / 2] = byteValue;
  }

  return arrayBuffer;
}

// 计算实际数量
function calAMount(amount: number, deci: number) {
  return amount * 10 ** deci;

}