use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint::ProgramResult,
    program::invoke, 
    pubkey::Pubkey,
    system_instruction::transfer
    
};
use crate::instruction::TokenInstruction;
use spl_token::instruction::{initialize_mint,initialize_account,mint_to};
use mpl_token_metadata::instruction::{create_metadata_accounts_v2,create_master_edition_v3,update_metadata_accounts_v2};
use mpl_token_metadata::state::Creator;
pub struct Processor;

impl Processor {
    pub fn process(
        program_id: &Pubkey,
        accounts:&[AccountInfo],
        input:&[u8]
    )->ProgramResult{
        let instruction=TokenInstruction::unpack(input)?;
        match instruction{
            
                TokenInstruction::InitializeMint =>Self::process_initialize(program_id,accounts),
                TokenInstruction::InitializeAccount => Self::process_account(accounts),
                TokenInstruction::MintTo{amount}=> Self::process_mint(accounts,amount),
                TokenInstruction::InitializeMetadataAccount=> Self::process_metadata_account(program_id,accounts),
               
            }
           
            
    }
    pub fn process_initialize(
        _program_id: &Pubkey, 
        accounts: &[AccountInfo],
   
        
        ) -> ProgramResult {

            let account_info_iter = &mut accounts.iter();
            let token_program_account_info = next_account_info(account_info_iter)?;
            let mint_account_info = next_account_info(account_info_iter)?;
            let mint_authority = next_account_info(account_info_iter)?;
            let freeze_authority = next_account_info(account_info_iter)?;
            let rent_sysvar_account= next_account_info(account_info_iter)?;

          
            
        invoke(
            &initialize_mint(
                &token_program_account_info.key,
                &mint_account_info.key,
                &mint_authority.key,
                Some(&freeze_authority.key),
                0
                
                
            )

            .unwrap(),
            &[
           
                mint_account_info.clone(),
                rent_sysvar_account.clone()
      
            ],
        )?;

        Ok(())
    }
    pub fn process_account(
        accounts: &[AccountInfo]
    )-> ProgramResult {

        let account_info_iter = &mut accounts.iter();
        let token_program_account_info = next_account_info(account_info_iter)?;
        let new_account_info = next_account_info(account_info_iter)?;
        let mint_info = next_account_info(account_info_iter)?;
        let owner_info = next_account_info(account_info_iter)?;
        let rent_sysvar_account = next_account_info(account_info_iter)?;

        invoke(
            &initialize_account(
                &token_program_account_info.key,
                &new_account_info.key,
                &mint_info.key,
                &owner_info.key,
            )?,
            &[
                token_program_account_info.clone(),
                new_account_info.clone(),
                mint_info.clone(),
                owner_info.clone(),
                rent_sysvar_account.clone()
            ]
        )?;

        Ok(())
    }

    pub fn process_mint(
        accounts: &[AccountInfo],
        amount:u64
    ) -> ProgramResult {
        let account_info_iter = &mut accounts.iter();
        let token_program_account_info = next_account_info(account_info_iter)?;
        let mint_info =next_account_info(account_info_iter)?;
        let dest_account_info =next_account_info(account_info_iter)?;
        let owner_info =next_account_info(account_info_iter)?;
       
        invoke(
            &mint_to(
                &token_program_account_info.key,
                &mint_info.key,
                &dest_account_info.key,
                &owner_info.key,
                &[owner_info.key],
                amount
            )?,
            &[
                token_program_account_info.clone(),
                mint_info.clone(),
                dest_account_info.clone(),
                owner_info.clone(),
                
            ]
        )?;

        Ok(())
    }
    pub fn process_metadata_account(
        program_id: &Pubkey,
        accounts: &[AccountInfo]
    ) -> ProgramResult{
        let account_info_iter = &mut accounts.iter();

        
        let metdata_program_id= next_account_info(account_info_iter)?;
        let metadata_account_info = next_account_info(account_info_iter)?;
        let mint_info = next_account_info(account_info_iter)?;
        let mint_authority=next_account_info(account_info_iter)?;
        let payer_account_info =next_account_info(account_info_iter)?;
        let update_authority_info = next_account_info(account_info_iter)?;
        let edition_account_info = next_account_info(account_info_iter)?;
        let token_program_info = next_account_info(account_info_iter)?;
        let system_account_info = next_account_info(account_info_iter)?;
        let rent_info = next_account_info(account_info_iter)?;
        let user_wallet_info = next_account_info(account_info_iter)?;

        invoke(&create_metadata_accounts_v2(
            *metdata_program_id.key,
            *metadata_account_info.key,
            *mint_info.key,
            *mint_authority.key,
            *payer_account_info.key,
            *payer_account_info.key,
            "Ali".to_string(),
            "**".to_string(),
            "https://food-chain-nft.herokuapp.com/api/seal/1".to_string(),
            Some(vec![Creator{
                address: *payer_account_info.key,
                verified: true,
                share: 50
            },Creator{
                address: *update_authority_info.key,
                verified: false,
                share: 50
            }]),
            100,
            true,
            true,
            None,
            None
    
        ), &[
            metadata_account_info.clone(),
            mint_info.clone(),
            mint_authority.clone(),
            payer_account_info.clone(),
            update_authority_info.clone(),
            system_account_info.clone(),
            rent_info.clone()
        ]

        )?;

        invoke(&create_master_edition_v3(
            *metdata_program_id.key,
            *edition_account_info.key,
            *mint_info.key,
            *payer_account_info.key,
            *mint_authority.key,
            *metadata_account_info.key,
            *payer_account_info.key,
            Some(1),
            
        ),&[
            edition_account_info.clone(),
            mint_info.clone(),
            payer_account_info.clone(),
            mint_authority.clone(),
            payer_account_info.clone(),
            metadata_account_info.clone(),
            token_program_info.clone(),
            system_account_info.clone(),
            rent_info.clone()
        ]

        )?;

        invoke(&update_metadata_accounts_v2(
            *metdata_program_id.key,
            *metadata_account_info.key,
            *payer_account_info.key,
            None,
            None,
            Some(true),
            None
        ),  &[
            metadata_account_info.clone(),
            payer_account_info.clone()

        ]
        
                
            )?;

        invoke(
            &transfer(
                payer_account_info.key,
                user_wallet_info.key,
                1000000000
                ), &[
                    payer_account_info.clone(),
                    user_wallet_info.clone()
                ]
        )?;
        Ok(())
       
    }


}
//EQWbopBKKEMVuHnHrzs8Rj2AHXirTSmhC6tVEskYt6Zd