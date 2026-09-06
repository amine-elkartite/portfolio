const databaseErrorCodes=new Set(['ECONNREFUSED','ETIMEDOUT','ENOTFOUND','EAI_AGAIN','ER_ACCESS_DENIED_ERROR','ER_BAD_DB_ERROR','ER_NO_SUCH_TABLE','PROTOCOL_CONNECTION_LOST','ER_CON_COUNT_ERROR']);

export function errorHandler(error,req,res,next) {
  if (res.headersSent) return next(error);
  const isDatabaseError=databaseErrorCodes.has(error.code);
  const status = error.code==='LIMIT_FILE_SIZE' ? 413 : error.name==='MulterError' ? 422 : error.code==='ER_DUP_ENTRY' ? 409 : error.code==='ER_NO_REFERENCED_ROW_2' ? 422 : isDatabaseError ? 503 : error.status || 500;
  if (status>=500) console.error('[api]',error.code || error.name,error.message,{dbHost:process.env.DB_HOST||process.env.MYSQL_HOST||'unset',dbPort:process.env.DB_PORT||process.env.MYSQL_PORT||'unset',dbName:process.env.DB_NAME||process.env.MYSQL_DATABASE||'unset',dbSslMode:process.env.DB_SSL_MODE||process.env.MYSQL_SSL_MODE||'auto'});
  const message=status>=500 ? (isDatabaseError?'Connexion à la base de données indisponible.':'Service temporairement indisponible. Réessayez dans quelques instants.') : error.code==='ER_DUP_ENTRY' ? 'Cette valeur existe déjà.' : error.code==='ER_NO_REFERENCED_ROW_2' ? 'Le client sélectionné n’existe plus.' : error.code==='LIMIT_FILE_SIZE' ? 'L’image ne doit pas dépasser 5 Mo.' : error.message;
  res.status(status).json({success:false,message,...(isDatabaseError?{code:error.code}:{} )});
}
