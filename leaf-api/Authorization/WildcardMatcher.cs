//namespace WebAPI.Authorization
//{
//    public static class WildcardMatcher
//    {
//        public static bool Match(string pattern, string input)
//        {
//            return MatchRecursive(pattern.AsSpan(), input.AsSpan());
//        }

//        private static bool MatchRecursive(ReadOnlySpan<char> pattern, ReadOnlySpan<char> input)
//        {
//            while (true)
//            {
//                if (pattern.IsEmpty)
//                    return input.IsEmpty;

//                if (pattern[0] == '*')
//                {
//                    // Skip consecutive wildcards
//                    var rest = pattern[1..];
//                    while (!rest.IsEmpty && rest[0] == '*')
//                        rest = rest[1..];

//                    if (rest.IsEmpty)
//                        return true;

//                    for (int i = 0; i <= input.Length; i++)
//                    {
//                        if (MatchRecursive(rest, input[i..]))
//                            return true;
//                    }
//                    return false;
//                }

//                if (input.IsEmpty || pattern[0] != input[0])
//                    return false;

//                pattern = pattern[1..];
//                input = input[1..];
//            }
//        }
//    }
//}
