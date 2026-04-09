/**
 * Backwards-compatibility shim.
 * All card and badge primitives now come from shadcn.
 * Import directly from their own files in new code:
 *   import { Card, CardHeader, ... } from "@/components/ui/card"
 *   import { Badge } from "@/components/ui/badge"
 */
export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardAction,
} from "@/components/ui/card";

export { Badge } from "@/components/ui/badge";
