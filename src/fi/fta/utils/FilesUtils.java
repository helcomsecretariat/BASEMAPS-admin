package fi.fta.utils;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.SortedSet;
import java.util.StringTokenizer;
import java.util.TreeSet;

import org.springframework.web.multipart.MultipartFile;

public class FilesUtils
{
	
	public static boolean isEmpty(MultipartFile file)
	{
		return file == null || file.isEmpty();
	}
	
	public static SortedSet<String> getUploadedEmails(MultipartFile file) throws IOException
	{
		SortedSet<String> ret = new TreeSet<String>();
		BufferedReader buff = new BufferedReader(new InputStreamReader(file.getInputStream()));
		String line;
		while ((line = buff.readLine()) != null)
		{
            StringTokenizer t = new StringTokenizer(line.replaceAll("'", "").trim(), " ,;<>");
            while (t.hasMoreTokens())
            {
            	String e = t.nextToken().trim();
            	if (Util.isValidEmail(e))
            	{
            		ret.add(e);
            	}	
            }
        }
        buff.close();
        return ret;
	}
	
}
