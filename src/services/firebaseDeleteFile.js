import { getStorage, ref, deleteObject } from "firebase/storage";

const deleteFileFromStorage = async (fileUrl) => {
    if (!fileUrl) {
        throw new Error('URL do arquivo não fornecida.');
    }

    // Extrai o caminho do arquivo da URL fornecida
    const decodeUrl = decodeURIComponent(fileUrl);
    const regex = /https:\/\/firebasestorage\.googleapis\.com\/v0\/b\/[^/]+\/o\/([^?]+)/;
    const match = decodeUrl.match(regex);

    if (!match || match.length < 2) {
        throw new Error('URL do arquivo inválida.');
    }

    const filePath = match[1]; // Caminho do arquivo extraído da URL

    const storage = getStorage();
    const storageRef = ref(storage, filePath);

    try {
        await deleteObject(storageRef);
        console.log('Arquivo deletado com sucesso!');
    } catch (error) {
        console.error('Erro ao deletar o arquivo:', error.message);
        throw error; // Rejoga o erro para o código que chamou a função
    }
};

export default deleteFileFromStorage;
