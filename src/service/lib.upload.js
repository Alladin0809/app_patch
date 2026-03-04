"use strict";

import axios from "axios";
import imageCompression from "browser-image-compression";
import FormData from 'form-data';
import { PinataSDK } from "pinata";

const MAX_FILE_SIZE_BYTES = 5.0 * 1024 * 1024; // 2 MB in bytes
const uri = import.meta.env.VITE_IPFS_DOMAIN;
const token = import.meta.env.VITE_JWT_KEY

const pinata = new PinataSDK({
    pinataJwt: token,
    pinataGateway: token
  });

async function getImageUrl(token) {
    try {
      console.log("getImageUrl "+token)
      const data = await pinata.gateways.public.get(token);
      console.log("getImageUrl "+data)
      const url = await pinata.gateways.convert( token)
      console.log("getImageUrl "+url)
    } catch (error) {
      console.log("getImageUrl "+error);
    }
  }

// 压缩图片
const compressImage = async (file) => {
    const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1024,
        useWebWorker: true,
    };
    try {
        if (file.type === "image/png" || file.type === "image/jpg" || file.type === "image/jpeg" || file.type === "image/webp") {
            return await imageCompression(file, options);
        } else {
            return file; // 对于其他格式，直接返回原始文件
        }
    } catch (error) {
        return file; // 在压缩失败时返回原始文件
    }
}

//上传图片或者json数据方法
const pinFileToIPFS = async (file, type) => {
    const formData = new FormData();

    formData.append("file", file);

    if (type === "image") {
        if (file.size > MAX_FILE_SIZE_BYTES) {
            throw new Error("File size exceeds the maximum limit (5MB). Please upload a smaller file.");
        }

        const pinataMetadata = JSON.stringify({
            name: "Image file",
        });
        formData.append("pinataMetadata", pinataMetadata);
    } else if (type === "json") {
        const jsonBlob = new Blob([JSON.stringify(file)], { type: "application/json" });
        formData.append("file", jsonBlob, "data.json");

        const pinataMetadata = JSON.stringify({
            name: "JSON data",
        });
        formData.append("pinataMetadata", pinataMetadata);
    }

    const pinataOptions = JSON.stringify({
        cidVersion: 0,
    });
    formData.append("pinataOptions", pinataOptions);

    try {
        const data = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
            maxBodyLength: "Infinity",
            headers: {
                "Content-Type": `multipart/form-data; boundary=${formData._boundary}`,
                Authorization: `Bearer ${token}`,
            },
        }).then((res) => res.data);

        //getImageUrl(data.IpfsHash);
        return data
        //return uri + data.IpfsHash;
    } catch (error) {
        throw new Error("IPFS upload failed");
    }
}

const unpinHashToIPFS = async (hash) => {

    if (!!!hash) {
       return
    }

    console.log("unpinHashToIPFS " + hash);
    if (hash.includes("http") || hash.includes("http")) {
        hash = hash.split('/').filter(Boolean).pop()
        console.log("unpinHashToIPFS lastPart" + hash);
    }

    if (!hash) {
        return
    }

    axios.delete(`https://api.pinata.cloud/pinning/unpin/${hash}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then(() => {
      console.log("File is unpin");
    })
    .catch((err) => {
      console.error(err);
    });
}


export async function OGImage(file,mint) {

}

export async function DeleteIPFSHash(hash) {
    return await unpinHashToIPFS(hash)
}



// 上传图片
export async function ImagesOrFile(file, type) {
    if (type === "image") {
        // 压缩图片，如果压缩成功就用压缩的文件，压缩失败直接传正常文件
        file = await compressImage(file);
        // const compressedFile = await compressImage(file);
        // return await pinFileToIPFS(compressedFile, type);
    }
    return await pinFileToIPFS(file, type);
}

async function JSON2IPFS({name,symbol,description,image,banner,twitter,telegram,discord,website,ogimage,is_cloneai}) {
    return await ImagesOrFile({name,symbol,description,image,banner,twitter,telegram,discord,website,ogimage,is_cloneai}, "json");
}

export async function JSON2IPFSURL(data) {
    try{
        console.log("JSON2IPFSURL:" + JSON.stringify(data))
        if (!data) {
            return null
        }
        
        let result = await ImagesOrFile(data, "json")
        return import.meta.env.VITE_IPFS_DOMAIN+result.IpfsHash
    }
    catch (error){
        return null
    }
}

export async function IMAGE2IPFSURL(data) {
    try{
        let result = await ImagesOrFile(data, "image")
        return import.meta.env.VITE_IPFS_DOMAIN+result.IpfsHash
    }
    catch (error){
        return null
    }
}

export default {
    ImagesOrFile,
    JSON2IPFS,
    JSON2IPFSURL,
    DeleteIPFSHash,
    IMAGE2IPFSURL
}