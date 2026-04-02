  
  
  
-- ===============================================================================================================  
-- Author:   Tiago Medeiros  
-- Last Updated: 11.29.2022  
-- Description:  Used to Get User  
-- Application:  CCFTL API  
-- Updates:   
-- 08/10/2024 MCG Remove dp_Users.User Email references as this field is being removed by ACST.  
-- 09/01/2026 Bounteous added Nickname to the response  
-- ===============================================================================================================  
  
CREATE PROCEDURE [dbo].[api_ccfl_ma_get_user]  
    @UserID AS INT  
  , @UserName AS VARCHAR(80) = NULL  
  , @Email AS VARCHAR(80) = NULL  
  , @Phone AS VARCHAR(80) = NULL  
AS  
BEGIN  
    IF @UserID > 0  
        SELECT u.[User_ID]  
             , u.[User_Name]  
             , u.[Display_Name]  
             , u.[Password]  
             , u.[Admin]  
             , u.[Domain_ID]  
             , u.[Publications_Manager]  
             , u.[Contact_ID]  
             , u.[Supervisor]  
             , u.[User_GUID]  
             , u.[Can_Impersonate]  
             , u.[__ShelbyID]  
             , u.[__Old_User_ID]  
             , u.[In_Recovery]  
             , u.[Data_Service_Permissions]  
             , u.[Read_Permitted]  
             , u.[Create_Permitted]  
             , u.[Update_Permitted]  
             , u.[Delete_Permitted]  
             , u.[Time_Zone]  
             , u.[Locale]  
             , u.[Theme]  
             , u.[Setup_Admin]  
             , u.[Local_Network_Name]  
             , u.[Login_Attempts]  
             , u.[MFA_Required]  
             , u.[Delete_Account_Info]  
             , u.[Delete_Requested_Date]  
             , u.[Reason_Deleted]  
             , u.[__Unmerge_Date]  
             , c.First_Name  
             , c.Last_Name  
             , c.Nickname  
        FROM dp_Users u  
             LEFT OUTER JOIN Contacts c ON c.User_Account = u.User_ID  
        WHERE User_ID = @UserID;  
    ELSE IF @UserName IS NOT NULL  
        SELECT u.[User_ID]  
             , u.[User_Name]  
             , u.[Display_Name]  
             , u.[Password]  
             , u.[Admin]  
             , u.[Domain_ID]  
             , u.[Publications_Manager]  
             , u.[Contact_ID]  
             , u.[Supervisor]  
             , u.[User_GUID]  
             , u.[Can_Impersonate]  
             , u.[__ShelbyID]  
             , u.[__Old_User_ID]  
             , u.[In_Recovery]  
             , u.[Data_Service_Permissions]  
             , u.[Read_Permitted]  
             , u.[Create_Permitted]  
             , u.[Update_Permitted]  
             , u.[Delete_Permitted]  
             , u.[Time_Zone]  
             , u.[Locale]  
             , u.[Theme]  
             , u.[Setup_Admin]  
             , u.[Local_Network_Name]  
             , u.[Login_Attempts]  
             , u.[MFA_Required]  
             , u.[Delete_Account_Info]  
             , u.[Delete_Requested_Date]  
             , u.[Reason_Deleted]  
             , u.[__Unmerge_Date]  
             , c.First_Name  
             , c.Last_Name  
             , c.Nickname  
        FROM dp_Users u  
             LEFT OUTER JOIN Contacts c ON c.User_Account = u.User_ID  
        WHERE User_Name LIKE @UserName;  
    ELSE IF @Email IS NOT NULL  
        SELECT u.[User_ID]  
             , u.[User_Name]  
             , u.[Display_Name]  
             , u.[Password]  
             , u.[Admin]  
             , u.[Domain_ID]  
             , u.[Publications_Manager]  
             , u.[Contact_ID]  
             , u.[Supervisor]  
             , u.[User_GUID]  
             , u.[Can_Impersonate]  
             , u.[__ShelbyID]  
             , u.[__Old_User_ID]  
             , u.[In_Recovery]  
             , u.[Data_Service_Permissions]  
             , u.[Read_Permitted]  
             , u.[Create_Permitted]  
             , u.[Update_Permitted]  
             , u.[Delete_Permitted]  
             , u.[Time_Zone]  
             , u.[Locale]  
             , u.[Theme]  
             , u.[Setup_Admin]  
        , u.[Local_Network_Name]  
             , u.[Login_Attempts]  
             , u.[MFA_Required]  
             , u.[Delete_Account_Info]  
             , u.[Delete_Requested_Date]  
             , u.[Reason_Deleted]  
             , u.[__Unmerge_Date]  
             , c.First_Name  
             , c.Last_Name  
             , c.Nickname  
        FROM dp_Users u  
             LEFT OUTER JOIN Contacts c ON c.User_Account = u.User_ID  
        WHERE User_Name LIKE @Email  
              OR c.Email_Address LIKE @Email;  
    ELSE  
        SELECT u.[User_ID]  
             , u.[User_Name]  
             , u.[Display_Name]  
             , u.[Password]  
             , u.[Admin]  
             , u.[Domain_ID]  
             , u.[Publications_Manager]  
             , u.[Contact_ID]  
             , u.[Supervisor]  
             , u.[User_GUID]  
             , u.[Can_Impersonate]  
             , u.[__ShelbyID]  
             , u.[__Old_User_ID]  
             , u.[In_Recovery]  
             , u.[Data_Service_Permissions]  
             , u.[Read_Permitted]  
             , u.[Create_Permitted]  
             , u.[Update_Permitted]  
             , u.[Delete_Permitted]  
             , u.[Time_Zone]  
             , u.[Locale]  
             , u.[Theme]  
             , u.[Setup_Admin]  
             , u.[Local_Network_Name]  
             , u.[Login_Attempts]  
             , u.[MFA_Required]  
             , u.[Delete_Account_Info]  
             , u.[Delete_Requested_Date]  
             , u.[Reason_Deleted]  
             , u.[__Unmerge_Date]  
             , c.First_Name  
             , c.Last_Name  
             , c.Nickname  
        FROM dp_Users u  
             INNER JOIN Contacts c ON c.Contact_ID = u.Contact_ID  
        WHERE REPLACE (REPLACE (REPLACE (c.Mobile_Phone, '-', ''), ')', ''), '(', '') LIKE REPLACE (  
                                                                                               REPLACE (  
                                                                                                   REPLACE (  
                                                                                                       @Phone, '-', '')  
                                                                                                 , ')'  
                                                                                                 , '')  
                                                                                             , '('  
                                                                                             , '');  
END;  