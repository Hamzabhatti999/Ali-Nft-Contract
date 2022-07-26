import {
    PublicKey,
    TransactionInstruction,
    Connection,
    Keypair,
    sendAndConfirmTransaction,
    Transaction,
    SystemProgram,
    SYSVAR_RENT_PUBKEY,
    
    
  } from '@solana/web3.js';
  
  import * as BufferLayout from '@solana/buffer-layout';
  import { blob } from '@solana/buffer-layout';
  import {u64, TOKEN_PROGRAM_ID, MintLayout, AccountLayout} from '@solana/spl-token' ;


  const publicKey = (property = 'publicKey') => {
    return blob(32, property);
  };
  
  const uint64 = ( property = 'uint64')=>{
      return blob(8,property);
  };

  let payer:Keypair;
  export function getpayer(){

    const secretkeyString = "[231,60,102,126,106,146,164,102,73,142,129,209,43,66,111,154,231,6,122,35,30,212,229,209,240,66,167,38,138,243,14,196,165,41,4,6,138,50,117,245,195,108,179,94,135,141,91,157,86,253,22,34,148,251,155,53,1,235,211,67,158,132,218,50]";
    const secretKey = Uint8Array.from(JSON.parse(secretkeyString));
    return Keypair.fromSecretKey(secretKey);
  }

  let connection= new Connection("https://api.devnet.solana.com");
  

  async function MintInsruction(programId:PublicKey,mintkey:PublicKey,mint_auth:PublicKey,decimal:number) {

    const balanceNeeded=  await connection.getMinimumBalanceForRentExemption(MintLayout.span);
   
    payer = getpayer();
    
    let tx= new Transaction();
    tx.add(SystemProgram.createAccount({
        fromPubkey: payer.publicKey,
        newAccountPubkey: mintkey,
        lamports: balanceNeeded,
        space: MintLayout.span,
        programId: TOKEN_PROGRAM_ID
    }
    ))
     
    const Instructionlayout = BufferLayout.struct([BufferLayout.u8('instruction')]);
    const data = Buffer.alloc(Instructionlayout.span);
    Instructionlayout.encode({
      instruction: 0,
    }, data);
    console.log(data)

      let keys = [{
          pubkey: TOKEN_PROGRAM_ID,
          isSigner: false,
          isWritable: false
      },{
        pubkey: mintkey,
        isSigner: true,
        isWritable: true
      },{     
         pubkey: mint_auth,
        isSigner: false,
        isWritable: true
    },{
        pubkey: mint_auth,
        isSigner: false,
        isWritable: true
    },{
        pubkey: SYSVAR_RENT_PUBKEY,
        isSigner: false,
        isWritable: false
    }];
    tx.add(new TransactionInstruction({
        keys,data,programId:programId
    }))
    return tx;
  }


  async function AccountInsruction(programId:PublicKey,mintkey:PublicKey,Accountkey:PublicKey) {

    const balanceNeeded=  await connection.getMinimumBalanceForRentExemption(AccountLayout.span);
    
    payer = getpayer();
    let tx= new Transaction();
    tx.add(SystemProgram.createAccount({
        fromPubkey: payer.publicKey,
        newAccountPubkey: Accountkey,
        lamports: balanceNeeded,
        space: AccountLayout.span,
        programId: TOKEN_PROGRAM_ID
    }
    ))
    const Instructionlayout = BufferLayout.struct([BufferLayout.u8('instruction')]);
    const data = Buffer.alloc(Instructionlayout.span);
    Instructionlayout.encode({
      instruction: 1,
    }, data);
    console.log(data)
      let keys = [{
          pubkey: TOKEN_PROGRAM_ID,
          isSigner: false,
          isWritable: false
      },{
        pubkey: Accountkey,
        isSigner: true,
        isWritable: true
      },{     
         pubkey: mintkey,
        isSigner: false,
        isWritable: true
    },{
        pubkey: payer.publicKey,
        isSigner: false,
        isWritable: true
    },{
        pubkey: SYSVAR_RENT_PUBKEY,
        isSigner: false,
        isWritable: false
    }];
    tx.add(new TransactionInstruction({
        keys,data,programId:programId
    }))
    return tx;
  
  
  }

  async function MinttoInsruction(programId:PublicKey,mintkey:Keypair,destination:Keypair) {
    payer = getpayer();
    const tx= new Transaction();
    
    const Instructionlayout = BufferLayout.struct([BufferLayout.u8('instruction'),uint64('amount')]);
    const data = Buffer.alloc(Instructionlayout.span);
    Instructionlayout.encode({
      instruction: 2,
      amount: new u64(1).toBuffer()
    }, data);
    console.log(data)
      let keys = [{
          pubkey: TOKEN_PROGRAM_ID,
          isSigner: false,
          isWritable: false
      },{
        pubkey: mintkey.publicKey,
        isSigner: false,
        isWritable: true
      },{     
         pubkey: destination.publicKey,
        isSigner: false,
        isWritable: true
    },{
        pubkey: payer.publicKey,
        isSigner: false,
        isWritable: true
   
    }];

    tx.add(await MintInsruction(programId,mintkey.publicKey,payer.publicKey,7))
    tx.add(await  AccountInsruction(programId,mintkey.publicKey,destination.publicKey))
    tx.add(new TransactionInstruction({
        keys,data,programId:programId
    }))
    return tx
   
  }

  async function metadataInstruction(programId:PublicKey,mintkey:Keypair,destination:Keypair) {
   const metadataAccount: any=await PublicKey.findProgramAddress(
      [
        Buffer.from('metadata', 'utf8'),
        new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s").toBuffer(),
        mintkey.publicKey.toBuffer(),
        
      ],
      new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"),
    );
    const masterEditionAccount: any=await PublicKey.findProgramAddress(
      [
        Buffer.from('metadata', 'utf8'),
        new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s").toBuffer(),
        mintkey.publicKey.toBuffer(),
        Buffer.from('edition', 'utf8'),
      ],
      new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"),
    );
      payer = getpayer();
    const Instructionlayout = BufferLayout.struct([BufferLayout.u8('instruction')]);
    const data = Buffer.alloc(Instructionlayout.span);
    Instructionlayout.encode({
      instruction: 3,
    }, data);
    console.log(data)
    console.log(metadataAccount[0])
    let keys=[
      {
        pubkey:new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"),
        isSigner: false,
          isWritable: false
      },{
        pubkey: metadataAccount[0],
        isSigner: false,
          isWritable: true
      },{
        pubkey: mintkey.publicKey,
        isSigner: false,
          isWritable: true
      },{
        pubkey: payer.publicKey,
        isSigner: true,
        isWritable: true
      },{
        pubkey: payer.publicKey,
        isSigner: true,
        isWritable: true
      },{
        pubkey:new PublicKey("BxciCXLr7u6qH6uVdjiZH1QYeNF3K6DpcLAWPuodCzbS"),
        isSigner: false,
        isWritable: true
      },{
        pubkey: masterEditionAccount[0],
        isSigner: false,
        isWritable: true
      },{
        pubkey: TOKEN_PROGRAM_ID,
        isSigner: false,
        isWritable: false
      },{
        pubkey: SystemProgram.programId,
        isSigner: false,
        isWritable: false
      },{
        pubkey: SYSVAR_RENT_PUBKEY,
        isSigner: false,
        isWritable: false
      },{
        pubkey: new PublicKey("BxciCXLr7u6qH6uVdjiZH1QYeNF3K6DpcLAWPuodCzbS"),
        isSigner: false,
        isWritable: true
      }
    ];
    
    const tx= new Transaction();
  
    tx.add(await MinttoInsruction(programId,mintkey,destination))
    tx.add(new TransactionInstruction({
      keys,data,programId:programId
  }))
    let fun = await sendAndConfirmTransaction(connection, tx, [payer,mintkey,destination])
    console.log(fun);
  }
    async function dumb() {
      // let tokenkey= Keypair.generate();
      
      // const val=await Token.createMint(connection,payer,payer.publicKey,payer.publicKey,0,TOKEN_PROGRAM_ID)    
      // let tokenAccount=await val.createAccount(payer.publicKey)
      // val.mintTo(tokenAccount,payer,[],100000)
      // console.log(tokenAccount.toBase58())
      const addr =new PublicKey("BxciCXLr7u6qH6uVdjiZH1QYeNF3K6DpcLAWPuodCzbS")
      const tranferval = SystemProgram.transfer({
       fromPubkey: payer.publicKey,
       toPubkey: addr,
       lamports: 100000000
      });
      let fun = await sendAndConfirmTransaction(connection, new Transaction().add(tranferval), [payer])
      console.log(fun); 
    }
async function takeAccount() {
  /*const tokenAccount= new PublicKey("CkAmM9JRnnsy6mQLPDHK1PbQz34GekYbofxkiRww9RRc");
  let accountInfo: any = await connection.getAccountInfo(tokenAccount);
  console.log(accountInfo.owner.toBase58())
  let token_obj= new Token(connection,new PublicKey("AzHdZnt2HuUKfv25oJwuS3v2aeJnagntVMSEonDhDa2H"),TOKEN_PROGRAM_ID,payer);

  console.log(await token_obj.getMintInfo())*/
  const trans: any=await connection.getConfirmedSignaturesForAddress2(payer.publicKey)
 // console.log(trans[2])
  const arr : any=await connection.getTransaction(trans[2].signature)

  let  n  =arr.transaction.message.accountKeys.length;

 for (let i = 0; i < n; i++) {
  console.log(arr.transaction.message.accountKeys[i].toBase58())
}

}
  

 async function main() {
    payer = getpayer();
    console.log("payer",payer.publicKey.toBase58())
     let programId = new PublicKey("ApnsNrRY6iXuzR22AzSBFwe7uGLadVjStQkwa6ueLYdP");
     for(let i=0; i<25;i++){

     let Accountkey= Keypair.generate();
     let mintkey= Keypair.generate();
    //console.log(mintkey.publicKey.toBase58())
  
   await metadataInstruction(programId,mintkey,Accountkey)
  }
   //await dumb()
   //takeAccount()

 } 
 main()


