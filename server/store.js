/**
 * Store em memória partilhado entre configurações e autenticação.
 * A senha do usuário é usada no login e pode ser alterada em Configurações.
 */
export const store = {
  empresa: {
    nome: 'Shellton Auto Mecânica',
    cnpj: '28.046.205/0001-27',
    telefone: '(84) 99935-0741',
    email: 'shelltonjgomes44@gmail.com',
    endereco: '',
    assinaturaBase64: undefined,
  },
  usuario: {
    nome: 'Usuário',
    email: 'admin@oficina.com',
    senha: 'admin123',
  },
}
