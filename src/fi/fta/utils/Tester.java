package fi.fta.utils;

import java.util.regex.Pattern;

public class Tester
{
	
	/**
	 * @param args any arguments
	 */
	public static void main(String[] args)
	{
		try
		{
			
//			HibernateUtil.create();			
//			EmailAddressInGroupDAO dao = new EmailAddressInGroupDAO();
//			System.out.println(dao.isIncluded(new Long(51), "aaa"));
//			System.out.println(dao.isIncluded(new Long(51), "sss"));
//			System.out.println(dao.isIncluded(new Long(51), "@FA"));
//			System.out.println(dao.isIncluded(new Long(51), "bbb") == null);
//			System.out.println(dao.isIncluded(new Long(66), "aaa") == null);
//			System.out.println(dao.isIncluded(new Long(66), "bbb") == null);
//			HibernateUtil.close();
			
			Pattern p = Pattern.compile("[a-zA-Z\\u0105\\u010d]*");
			System.out.println(p.matcher("\u0105aaas\u010dadasd").matches());
			
			System.out.println(Util.isValidEmail("+!#$%^&*Andrysta.teD-tam}}s@gmail.comlt"));
			
		}
		catch (Exception ex) {
			ex.printStackTrace();
			// TODO: handle exception
		}
	}
	
}
