import { getStorage, ref, uploadBytes } from "firebase/storage";

const uploadFileToStorage = async (file, local) => {
    if (!file) {
        throw new Error('Nenhum arquivo selecionado.');
    }

    const storage = getStorage();

    const fileExtension = file.name.split('.').pop();
    const timestamp = new Date().getTime();
    const fileName = `${timestamp}.${fileExtension}`;

    const storageRef = ref(storage, `${local}/${fileName}`);

    try {
        await uploadBytes(storageRef, file);
        console.log('Arquivo enviado com sucesso!');
        const fileAcess = `https://firebasestorage.googleapis.com/v0/b/english-a5ff5.appspot.com/o/${local}%2F${fileName}?alt=media`;
        return fileAcess;
    } catch (error) {
        console.error('Erro ao fazer upload do arquivo:', error.message);
        throw error; // Rejoga o erro para o código que chamou a função
    };
};

export default uploadFileToStorage;
